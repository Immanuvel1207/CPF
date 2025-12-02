const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'choosekonguengineeringcollegeforbestfuture';
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
  // Keep per-test results so users can take multiple assessments
  testResults: [
    {
      test: String,
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
      recommendedCareers: [String],
      completedAt: Date
    }
  ]
});

const questionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  text: { type: String, required: true },
  category: { type: String, enum: ['R', 'I', 'A', 'S', 'E', 'C'], required: true },
  // which test this question belongs to (e.g. 'RIASEC', 'Aptitude')
  test: { type: String, required: true, default: 'RIASEC' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);

// Middleware
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

// Career recommendations based on RIASEC
const careerRecommendations = {
  'R': ['Agriculture', 'Health Assistant', 'Computers', 'Construction', 'Mechanic/Machinist', 'Engineering', 'Food and Hospitality'],
  'I': ['Marine Biology', 'Engineering', 'Chemistry', 'Zoology', 'Medicine/Surgery', 'Consumer Economics', 'Psychology'],
  'A': ['Communications', 'Cosmetology', 'Fine and Performing Arts', 'Photography', 'Radio and TV', 'Interior Design', 'Architecture'],
  'S': ['Counseling', 'Nursing', 'Physical Therapy', 'Travel', 'Advertising', 'Public Relations', 'Education'],
  'E': ['Fashion Merchandising', 'Real Estate', 'Marketing/Sales', 'Law', 'Political Science', 'International Trade', 'Banking/Finance'],
  'C': ['Accounting', 'Court Reporting', 'Insurance', 'Administration', 'Medical Records', 'Banking', 'Data Processing']
};

// Metadata/descriptions for available tests (used by frontend to show cards)
const testsMeta = {
  RIASEC: {
    id: 'RIASEC',
    name: 'RIASEC Career Assessment',
    description: 'Interests-based career assessment (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)'
  },
  Aptitude: {
    id: 'Aptitude',
    name: 'Aptitude Test',
    description: 'Short quantitative and logical aptitude test'
  },
  Personality: {
    id: 'Personality',
    name: 'Personality Inventory',
    description: 'Brief personality inventory to capture work-style preferences'
  }
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
    // Support optional filtering by test name: /api/questions?test=RIASEC
    const filter = {};
    if (req.query.test) filter.test = req.query.test;
    const questions = await Question.find(filter).sort({ questionNumber: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return available tests with counts and metadata
app.get('/api/tests', authenticateToken, async (req, res) => {
  try {
    const agg = await Question.aggregate([
      { $group: { _id: '$test', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', count: 1 } }
    ]);

    const tests = agg.map(t => {
      const meta = testsMeta[t.name] || { id: t.name, name: t.name, description: '' };
      return {
        id: meta.id,
        name: meta.name,
        key: t.name,
        description: meta.description,
        questionCount: t.count
      };
    });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public (unauthenticated) version of tests list - useful for development/demo
app.get('/api/public/tests', async (req, res) => {
  try {
    const agg = await Question.aggregate([
      { $group: { _id: '$test', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', count: 1 } }
    ]);

    const tests = agg.map(t => {
      const meta = testsMeta[t.name] || { id: t.name, name: t.name, description: '' };
      return {
        id: meta.id,
        name: meta.name,
        key: t.name,
        description: meta.description,
        questionCount: t.count
      };
    });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public questions endpoint (no auth required) - use ?test=NAME to filter
app.get('/api/public/questions', async (req, res) => {
  try {
    const filter = {};
    if (req.query.test) filter.test = req.query.test;
    const questions = await Question.find(filter).sort({ questionNumber: 1 });
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

// Test Submission - Fixed calculation based on PDF (1=Disagree, 5=Agree gives points)
app.post('/api/submit-test', authenticateToken, async (req, res) => {
  try {
    const { answers, test } = req.body;

    // Only consider questions for the given test (fallback to all if not provided)
    const filter = {};
    if (test) filter.test = test;
    const questions = await Question.find(filter);
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    
    // Calculate scores: Only count if answer >= 4 (Agree or Strongly Agree)
    questions.forEach(q => {
      const answerValue = answers[q._id.toString()];
      if (answerValue >= 4) {
        scores[q.category] += 1;
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
    
    // Get career recommendations
    const recommendedCareers = careerRecommendations[primaryCareer] || [];
    
    const user = await User.findById(req.user.id);
    // Append per-test result instead of overwriting a single result
    user.testResults = user.testResults || [];
    const newResult = {
      test: test || 'RIASEC',
      scores,
      topThree: topThree.map(code => `${code} - ${careerMap[code]}`),
      primaryCareer: `${primaryCareer} - ${careerMap[primaryCareer]}`,
      recommendedCareers,
      completedAt: new Date()
    };
    user.testResults.push(newResult);
    // mark that user has completed at least one test
    user.hasCompletedTest = true;
    await user.save();
    // debug: log testResults to help trace unexpected mutations
    try { console.log('User testResults after submit:', user._id, user.testResults.map(t => t.test)); } catch(e) {}
    
    res.json({
      scores,
      topThree: topThree.map(code => `${code} - ${careerMap[code]}`),
      primaryCareer: `${primaryCareer} - ${careerMap[primaryCareer]}`,
      recommendedCareers,
      fullResult: newResult
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

app.get('/api/admin/students/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete student account completely
app.delete('/api/admin/students/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset student assessment only
app.post('/api/admin/students/:id/reset-assessment', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Optional body: { test: 'RIASEC' } to reset only that test
    const { test } = req.body || {};
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (test) {
      // Remove only matching test results
      user.testResults = (user.testResults || []).filter(tr => tr.test !== test);
      // Update hasCompletedTest depending on remaining results
      user.hasCompletedTest = (user.testResults && user.testResults.length > 0);
      await user.save();
      const safeUser = user.toObject();
      delete safeUser.password;
      return res.json({ message: `Assessment for ${test} reset successfully`, user: safeUser });
    }

    // No specific test provided: clear all results (legacy behavior)
    user.hasCompletedTest = false;
    user.testResults = [];
    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    res.json({ message: 'All assessments reset successfully', user: safeUser });
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