const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'your-secret-key-change-in-production';
const MONGODB_URI = 'mongodb://localhost:27017/mba-career-assessment';

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  hasCompletedTest: { type: Boolean, default: false },
  testResult: {
    scores: {
      R: Number,
      I: Number,
      A: Number,
      S: Number,
      E: Number,
      C: Number
    },
    topThree: [String],
    primaryCareer: String,
    completedAt: Date
  }
});

const questionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  text: { type: String, required: true },
  category: { type: String, enum: ['R', 'I', 'A', 'S', 'E', 'C'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { rollNumber, name, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      rollNumber,
      name,
      password: hashedPassword,
      role: role || 'student'
    });
    
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { rollNumber, password } = req.body;
    const user = await User.findOne({ rollNumber });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, rollNumber: user.rollNumber, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        rollNumber: user.rollNumber,
        name: user.name,
        role: user.role,
        hasCompletedTest: user.hasCompletedTest
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid old password' });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Question Routes
app.get('/api/questions', authenticateToken, async (req, res) => {
  try {
    const questions = await Question.find().sort({ questionNumber: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/questions', authenticateToken, isAdmin, async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/questions/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/questions/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Submission Route with Likert Scale (1-5)
app.post('/api/submit-test', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body; // answers is an object { questionId: score (1-5) }
    
    const questions = await Question.find();
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    
    // Calculate scores based on Likert scale responses (1-5)
    questions.forEach(q => {
      const answerValue = answers[q._id.toString()];
      if (answerValue !== undefined && answerValue !== null) {
        scores[q.category] += parseInt(answerValue);
      }
    });
    
    // Get top three categories
    const sortedScores = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    
    const topThree = sortedScores.map(([letter]) => letter);
    const primaryCareer = topThree[0];
    
    const careerMap = {
      R: 'Realistic',
      I: 'Investigative',
      A: 'Artistic',
      S: 'Social',
      E: 'Enterprising',
      C: 'Conventional'
    };
    
    const user = await User.findById(req.user.id);
    user.hasCompletedTest = true;
    user.testResult = {
      scores,
      topThree: topThree.map(code => `${code} - ${careerMap[code]}`),
      primaryCareer: `${primaryCareer} - ${careerMap[primaryCareer]}`,
      completedAt: new Date()
    };
    
    await user.save();
    
    res.json({
      scores,
      topThree: topThree.map(code => `${code} - ${careerMap[code]}`),
      primaryCareer: `${primaryCareer} - ${careerMap[primaryCareer]}`,
      fullResult: user.testResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Routes
app.get('/api/admin/students', authenticateToken, isAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/students/search', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { query } = req.query;
    const students = await User.find({
      role: 'student',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { rollNumber: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/students/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));