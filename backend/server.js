const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const XLSX = require('xlsx');

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

const JWT_SECRET = 'choosekonguengineeringcollegeforbestfuture';
const MONGODB_URI = 'mongodb+srv://nisar:nisar%402004@cluster0.7q9px.mongodb.net/?appName=Cluster0/mba-career-assessment';

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
  year: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  hasCompletedTest: { type: Boolean, default: false },
  // Keep per-test results so users can take multiple assessments
  testResults: [
    {
      test: String,
      // RIASEC fields
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
      // Personality fields
      score: Number,
      questionCount: Number,
      interpretation: String,
      feedback: String,
      // Aptitude fields
      correct: Number,
      total: Number,
      // EI (Emotional Intelligence) fields
      factors: mongoose.Schema.Types.Mixed,
      factorFeedback: mongoose.Schema.Types.Mixed,
      globalScore: Number,
      globalLevel: String,
      globalFeedback: String,
      // Common field
      completedAt: Date
    }
  ]
});

const questionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  text: { type: String, required: true },
  // category is required only for RIASEC questions; other tests (Aptitude/Personality) may not have a category
  category: { type: String, enum: ['R', 'I', 'A', 'S', 'E', 'C'], required: function() { return (this.test || 'RIASEC') === 'RIASEC'; } },
  // which test this question belongs to (e.g. 'RIASEC', 'Aptitude')
  test: { type: String, required: true, default: 'RIASEC' },
  // optional fields for other test types
  options: { type: [String], default: undefined },
  correctAnswer: { type: String },
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

// EI Factor interpretations and recommendations
const eiFeedback = {
  'Well-being': {
    low: 'Tends to have a gloomy outlook; may struggle with self-confidence or feel dissatisfied with current life circumstances. Focus on identifying small positive moments daily and practice gratitude.',
    average: 'Generally satisfied and realistic; possesses a balanced sense of self-worth with occasional bouts of insecurity. You have a solid foundation—consider activities that boost confidence.',
    high: 'Optimistic, happy, and fulfilled; has high self-esteem and a very positive outlook on the future. Use your positive energy to inspire others and maintain this momentum.'
  },
  'Self-control': {
    low: 'Likely impulsive or easily stressed; finds it difficult to stay calm under pressure or manage intense moods. Practice mindfulness and breathing techniques to regulate emotions.',
    average: 'Usually capable of staying calm; can regulate impulses in daily life but may feel overwhelmed by extreme stress. Develop coping strategies for high-pressure situations.',
    high: 'Excellent impulse control; highly resilient to stress and capable of regulating moods effectively. Your emotional regulation is a strength—help others develop these skills.'
  },
  'Emotionality': {
    low: 'May find it hard to express feelings or "read" others; potentially feels disconnected from own emotions. Try journaling or therapy to better understand your emotions.',
    average: 'Moderately in touch with feelings; can express emotions to friends but may occasionally misread subtle social cues. Practice active listening and empathy in conversations.',
    high: 'Highly empathetic and emotionally articulate; finds it easy to share feelings and understand others\' perspectives. Your emotional awareness is valuable in building strong relationships.'
  },
  'Sociability': {
    low: 'Often feels shy or reserved; may struggle to influence others or feel uncomfortable in social leadership roles. Start with small social interactions and build confidence gradually.',
    average: 'Comfortably social in most settings; can stand up for self when necessary but may prefer to avoid social confrontation. Practice assertiveness in low-stakes situations.',
    high: 'Socially confident and influential; a strong negotiator who feels at ease in various social environments. Consider taking on leadership roles to leverage your strengths.'
  }
};

// Career recommendations based on RIASEC
const careerRecommendations = {
  R: [
    'Building, repairing, assembling',
    'Operating tools or equipment',
    'Hands-on experiments and practical work',
    'Outdoor or physical tasks'
  ],
  I: [
    'Research, analysis, and experimentation',
    'Logical problem-solving and diagnostics',
    'Studying data, formulas, or systems',
    'Reading and exploring new concepts'
  ],
  A: [
    'Designing, drawing, writing, creating',
    'Visual storytelling, performing, composing',
    'Brainstorming and idea generation',
    'Crafting original or aesthetic solutions'
  ],
  S: [
    'Teaching, mentoring, counseling',
    'Group activities and teamwork',
    'Organizing events and coordinating people',
    'Providing guidance and support'
  ],
  E: [
    'Leading teams and projects',
    'Public speaking or pitching ideas',
    'Planning, organizing, and negotiating',
    'Managing people and resources'
  ],
  C: [
    'Data entry, documentation, record-keeping',
    'Managing schedules, files, and processes',
    'Maintaining accuracy and quality control',
    'Organizing information and workflows'
  ]
};

// Metadata/descriptions for available tests (used by frontend to show cards)
const testsMeta = {
  RIASEC: {
    id: 'RIASEC',
    name: 'RIASEC Career Assessment',
    description: 'Interests-based career assessment (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)'
  },
  Personality: {
    id: 'Personality',
    name: 'Personality Inventory',
    description: 'Brief personality inventory to capture work-style preferences'
  },
  EI: {
    id: 'EI',
    name: 'Emotional Intelligence (TEIQue-SF)',
    description: 'Measure your emotional intelligence across Well-being, Self-control, Emotionality, and Sociability'
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

// Test Submission - handle RIASEC, Personality (likert), Aptitude (mcq) and generic types
app.post('/api/submit-test', authenticateToken, async (req, res) => {
  try {
    const { answers, test } = req.body;

    // Only consider questions for the given test (fallback to all if not provided)
    const filter = {};
    if (test) filter.test = test;
    const questions = await Question.find(filter).sort({ questionNumber: 1 });

    const user = await User.findById(req.user.id);
    user.testResults = user.testResults || [];

    // RIASEC handling: sum likert values per category (1..5 per question)
    const detectedTest = (test || (questions[0] && questions[0].test) || '').toString().toUpperCase();
    if (detectedTest === 'RIASEC') {
      const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      questions.forEach(q => {
        const answerValue = Number(answers[q._id.toString()] || 0);
        if (!isNaN(answerValue) && q.category) {
          // sum the numeric value (1..5) into the respective category
          scores[q.category] = (scores[q.category] || 0) + answerValue;
        }
      });

      const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a).slice(0, 3);
      const topThree = sortedScores.map(([letter]) => letter);
      const primaryCareer = topThree[0] || 'R';
      const careerMap = { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' };
      const recommendedCareers = careerRecommendations[primaryCareer] || [];

      const newResult = {
        test: 'RIASEC',
        scores,
        topThree: topThree.map(code => `${code} - ${careerMap[code]}`),
        primaryCareer: `${primaryCareer} - ${careerMap[primaryCareer]}`,
        recommendedCareers,
        completedAt: new Date()
      };
      user.testResults.push(newResult);
      user.hasCompletedTest = true;
      await user.save();

      return res.json({
        fullResult: newResult,
        scores,
        topThree: newResult.topThree,
        primaryCareer: newResult.primaryCareer,
        recommendedCareers
      });
    }

    // Personality handling - likert responses 1..5, provide WEMWBS/SWEMWBS style interpretation
    if (detectedTest === 'PERSONALITY') {
      let total = 0;
      questions.forEach(q => {
        const v = Number(answers[q._id.toString()] || 0);
        if (!isNaN(v)) total += v;
      });

      const qCount = questions.length;
      let interpretation = '';
      if (qCount >= 14) {
        if (total <= 40) interpretation = 'Very low';
        else if (total <= 44) interpretation = 'Below average';
        else if (total <= 59) interpretation = 'Average';
        else interpretation = 'Above Average';
      } else {
        // 7-item
        if (total <= 17) interpretation = 'Very low';
        else if (total <= 20) interpretation = 'Below average';
        else if (total <= 27) interpretation = 'Average';
        else interpretation = 'Above Average';
      }

      const feedbackMessages = {
        'Very low': `This questionnaire measures mental wellbeing, which includes both positive feelings like happiness and positive functioning like problem solving and optimism. This score is in the very low range, suggesting there may be significant difficulties in this area compared to peers. Recovery is likely to benefit from help from a doctor or health professional and the individual may already be in contact with health services. There are also evidence-based steps everyone can take to support mental health for example:\n• Connect with others – talk to sympathetic people about how you are feeling now; \n• Be active – exercise changes our emotional states; \n• Find something that calms you or makes you feel happy and do it everyday; \n• Do something that helps someone else – this could include volunteering; \n• Keep learning - remembering that we can develop and grow changes our outlook on life;`,
        'Below average': `This questionnaire measures mental wellbeing, which includes both positive feelings like happiness and positive functioning like problems solving and optimism. This score is in the low range, suggesting that the individual could feel significantly better if they took some action to improve mental wellbeing. There are evidence-based steps we can all take to support mental health for example: \n• Connect with others – talk to sympathetic people about how you are feeling now; \n• Find something that calms you or makes you feel happy and do it everyday; \n• Do something that helps someone else – this could include volunteering; \n• Be active – exercise changes our emotional states; \n• Keep learning - remembering that we can develop and grow changes our outlook on life;`,
        'Average': `This questionnaire measures mental wellbeing, which includes both positive feelings like happiness and positive functioning like problem solving and optimism. This score is in the normal range, suggesting that this individual is doing OK compared to peers. However, someone with a score in this range could gain much in terms of resilience and quality of life by taking action to improve mental wellbeing. There are evidence-based steps we can all take to support mental health for example: \n• Do something that calms you or makes you feel happy everyday; \n• Do something that helps someone else – this could include volunteering; \n• Be active – exercise changes our emotional states; \n• Keep learning - remembering that we can develop and grow changes our outlook on life; \n• Connect with others – talk to sympathetic people about how you are feeling now;`,
        'Above Average': `This questionnaire measures mental wellbeing, which includes both positive feelings like happiness and positive functioning like problem solving and optimism. This score is in the above-average range, suggesting a high level of mental wellbeing compared to peers. To help maintain this level of mental wellbeing in the face of life’s ups and downs there are evidence-based steps we can all take for example: \n• Do something that calms you or makes you feel happy everyday; \n• Keep learning - remembering that we can develop and grow changes our outlook on life; \n• Be active – exercise changes our emotional states; \n• Do something that helps someone else – this could include volunteering; \n• Connect with others – talk to sympathetic people about how you are feeling now;`
      };

      const newResult = {
        test: 'Personality',
        score: total,
        questionCount: qCount,
        interpretation,
        feedback: feedbackMessages[interpretation] || '',
        completedAt: new Date()
      };
      user.testResults.push(newResult);
      user.hasCompletedTest = true;
      await user.save();

      return res.json({ fullResult: newResult, score: total, questionCount: qCount, interpretation, feedback: feedbackMessages[interpretation] || '' });
    }

    // Emotional Intelligence (EI/TEIQue-SF) handling
    if (detectedTest === 'EI') {
      // Apply reverse scoring to specified items: 2, 4, 5, 7, 8, 10, 12, 13, 14, 16, 18, 22, 25, 26, 28
      const reverseItems = [2, 4, 5, 7, 8, 10, 12, 13, 14, 16, 18, 22, 25, 26, 28];
      const processedAnswers = {};

      questions.forEach(q => {
        const rawValue = Number(answers[q._id.toString()] || 0);
        let value = rawValue;
        
        // Reverse score if question number is in reverseItems
        if (reverseItems.includes(q.questionNumber)) {
          value = 8 - rawValue; // 1→7, 2→6, 3→5, 4→4, 5→3, 6→2, 7→1
        }
        
        processedAnswers[q.questionNumber] = value;
      });

      // Calculate factors
      const getAverage = (itemNums) => {
        const sum = itemNums.reduce((acc, num) => acc + (processedAnswers[num] || 0), 0);
        return sum / itemNums.length;
      };

      const factors = {
        'Well-being': getAverage([5, 9, 12, 20, 24, 27]),
        'Self-control': getAverage([4, 7, 15, 19, 22, 30]),
        'Emotionality': getAverage([1, 2, 8, 13, 16, 17, 23, 28]),
        'Sociability': getAverage([6, 10, 11, 21, 25, 26])
      };

      // Calculate global score
      const allValues = Object.values(processedAnswers).filter(v => v);
      const globalScore = allValues.reduce((a, b) => a + b, 0) / allValues.length;

      // Determine levels and feedback
      const getLevelAndFeedback = (score) => {
        let level = '';
        if (score <= 3.0) level = 'Low';
        else if (score <= 4.9) level = 'Average';
        else level = 'High';
        return level.toLowerCase();
      };

      const factorFeedback = {};
      Object.entries(factors).forEach(([factor, score]) => {
        const level = getLevelAndFeedback(score);
        factorFeedback[factor] = {
          score: score.toFixed(2),
          level: level.charAt(0).toUpperCase() + level.slice(1),
          feedback: eiFeedback[factor][level]
        };
      });

      const globalLevel = getLevelAndFeedback(globalScore);
      const globalFeedback = globalLevel === 'low' 
        ? 'Indicates a significant need for developing emotional awareness and coping strategies for social demands.'
        : globalLevel === 'average'
        ? 'Possesses the emotional tools needed for functional success in school and social life.'
        : 'Indicates a high level of "Emotional Intelligence"; very effective at navigating the emotional landscape of life.';

      const newResult = {
        test: 'EI',
        factors,
        factorFeedback,
        globalScore: parseFloat(globalScore.toFixed(2)),
        globalLevel: globalLevel.charAt(0).toUpperCase() + globalLevel.slice(1),
        globalFeedback,
        completedAt: new Date()
      };

      user.testResults.push(newResult);
      user.hasCompletedTest = true;
      await user.save();

      return res.json({
        fullResult: newResult,
        factors,
        factorFeedback,
        globalScore: parseFloat(globalScore.toFixed(2)),
        globalLevel: globalLevel.charAt(0).toUpperCase() + globalLevel.slice(1),
        globalFeedback
      });
    }

    // Generic fallback: treat answers as truthy counts per category when available
    const genericScores = {};
    questions.forEach(q => {
      const val = answers[q._id.toString()];
      if (val === true || val === 1 || val === '1' || Number(val) > 0) {
        if (q.category) genericScores[q.category] = (genericScores[q.category] || 0) + 1;
      }
    });
    const newResult = { test: test || 'Unknown', scores: genericScores, completedAt: new Date() };
    user.testResults.push(newResult);
    user.hasCompletedTest = true;
    await user.save();
    return res.json({ fullResult: newResult });
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

// Admin: create single student (admin-only)
app.post('/api/admin/students', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { rollNumber, name, password, year } = req.body;
    if (!rollNumber || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields: rollNumber, name, password' });
    }

    const existing = await User.findOne({ rollNumber });
    if (existing) return res.status(409).json({ error: 'Student with this rollNumber already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ rollNumber, name, password: hashed, role: 'student', year });
    await user.save();
    const safe = user.toObject();
    delete safe.password;
    res.status(201).json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: bulk upload students via Excel/CSV (multipart/form-data, file field = 'file')
app.post('/api/admin/students/upload', authenticateToken, isAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    const results = { created: 0, updated: 0, skipped: 0, errors: [] };
    // We'll perform an existence-check and upsert in a single pass to count accurately
    for (const [i, row] of rows.entries()) {
      const norm = {};
      Object.keys(row).forEach(k => { norm[k.toString().toLowerCase().trim()] = row[k]; });
      const rollNumber = (norm.rollnumber || norm.roll_number || norm.roll) && String(norm.rollnumber || norm.roll_number || norm.roll).trim();
      const name = (norm.name && String(norm.name).trim()) || null;
      const year = (norm.year && String(norm.year).trim()) || undefined;
      const password = (norm.password && String(norm.password)) || 'student';

      if (!rollNumber || !name) { results.skipped++; continue; }

      const existed = await User.findOne({ rollNumber });
      const hashed = await bcrypt.hash(password, 10);
      await User.findOneAndUpdate({ rollNumber }, { rollNumber, name, password: hashed, year, role: 'student' }, { upsert: true, new: true, setDefaultsOnInsert: true });
      if (existed) results.updated++; else results.created++;
    }

    res.json({ message: 'Upload complete', details: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: bulk upload questions via Excel/CSV (multipart/form-data, file field = 'file')
app.post('/api/admin/questions/upload', authenticateToken, isAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    const results = { created: 0, updated: 0, skipped: 0, errors: [] };
    for (const [i, row] of rows.entries()) {
      const norm = {};
      Object.keys(row).forEach(k => { norm[k.toString().toLowerCase().trim()] = row[k]; });
      const qnum = norm.questionnumber || norm.question_number || norm['#'] || norm.qnum || norm.q;
      const text = (norm.text && String(norm.text).trim()) || null;
      const rawCategory = (norm.category && String(norm.category).trim()) || null;
      const testKey = (norm.test && String(norm.test).trim()) || req.body.test || 'RIASEC';

      if (!qnum || !text) {
        results.skipped++;
        results.errors.push({ row: i + 2, reason: 'missing questionNumber/text' });
        continue;
      }

      let cat = null;
      if ((testKey || '').toUpperCase() === 'RIASEC') {
        if (!rawCategory) {
          results.skipped++;
          results.errors.push({ row: i + 2, reason: 'missing category for RIASEC question' });
          continue;
        }
        cat = String(rawCategory).toUpperCase();
        if (!['R','I','A','S','E','C'].includes(cat)) {
          results.skipped++;
          results.errors.push({ row: i + 2, reason: `invalid category ${rawCategory}` });
          continue;
        }
      }

      // Parse options/correct answer for Aptitude questions
      let optionsArr = undefined;
      let correctAnswer = undefined;
      if ((testKey || '').toUpperCase() === 'APTITUDE') {
        // look for option1..option10 or a single 'options' cell (comma separated)
        const opts = [];
        for (let o = 1; o <= 10; o++) {
          const key = 'option' + o;
          if (norm[key]) opts.push(String(norm[key]).trim());
        }
        if (opts.length === 0 && norm.options) {
          const raw = String(norm.options || '').trim();
          if (raw) optionsArr = raw.split(/,|;/).map(s => s.trim()).filter(Boolean);
        } else if (opts.length) {
          optionsArr = opts;
        }

        correctAnswer = (norm.correctanswer || norm.answer || norm.correct) ? String(norm.correctanswer || norm.answer || norm.correct).trim() : undefined;
      }

      // upsert based on questionNumber + test
      const existing = await Question.findOne({ questionNumber: Number(qnum), test: testKey });
      if (existing) {
        existing.text = text;
        if (cat) existing.category = cat;
        existing.test = testKey;
        if (typeof optionsArr !== 'undefined') existing.options = optionsArr;
        if (typeof correctAnswer !== 'undefined') existing.correctAnswer = correctAnswer;
        await existing.save();
        results.updated++;
      } else {
        const payload = { questionNumber: Number(qnum), text, test: testKey };
        if (cat) payload.category = cat;
        if (typeof optionsArr !== 'undefined') payload.options = optionsArr;
        if (typeof correctAnswer !== 'undefined') payload.correctAnswer = correctAnswer;
        await Question.create(payload);
        results.created++;
      }
    }

    res.json({ message: 'Questions upload complete', details: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// Admin: Download all students' results as Excel/CSV
app.get('/api/admin/download-all-results', authenticateToken, isAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ name: 1 });

    // Prepare data for export
    const rows = [];
    
    // Add header row
    rows.push({
      'Roll Number': '',
      'Student Name': '',
      'Test Type': '',
      'RIASEC Category': '',
      'Aptitude Score': '',
      'Personality Score': '',
      'Personality Interpretation': '',
      'Completed Date': ''
    });

    // For each student, add rows for each test result
    students.forEach(student => {
      if (!student.testResults || student.testResults.length === 0) {
        rows.push({
          'Roll Number': student.rollNumber,
          'Student Name': student.name,
          'Test Type': 'No tests completed',
          'RIASEC Category': '',
          'Aptitude Score': '',
          'Personality Score': '',
          'Personality Interpretation': '',
          'Completed Date': ''
        });
      } else {
        // Create a row for each test
        const riasecResult = student.testResults.find(r => r.test === 'RIASEC');
        const aptitudeResult = student.testResults.find(r => r.test === 'Aptitude');
        const personalityResult = student.testResults.find(r => r.test === 'Personality');

        // If any test exists, create consolidated row
        if (riasecResult || aptitudeResult || personalityResult) {
          const riasecCategory = riasecResult 
            ? (riasecResult.topThree && riasecResult.topThree[0] 
              ? riasecResult.topThree[0].split(' - ')[0] 
              : 'N/A')
            : 'Not Completed';
          
          const aptitudeScore = aptitudeResult 
            ? `${aptitudeResult.score || aptitudeResult.correct || 0}/${aptitudeResult.total || 0}`
            : 'Not Completed';
          
          const personalityScore = personalityResult 
            ? personalityResult.score || personalityResult.total || 'N/A'
            : 'Not Completed';
          
          const personalityInterpretation = personalityResult 
            ? personalityResult.interpretation || 'N/A'
            : 'Not Completed';

          const latestDate = student.testResults.length > 0
            ? new Date(student.testResults[student.testResults.length - 1].completedAt).toLocaleString()
            : 'N/A';

          rows.push({
            'Roll Number': student.rollNumber,
            'Student Name': student.name,
            'Test Type': 'All Tests Summary',
            'RIASEC Category': riasecCategory,
            'Aptitude Score': aptitudeScore,
            'Personality Score': personalityScore,
            'Personality Interpretation': personalityInterpretation,
            'Completed Date': latestDate
          });
        }
      }
    });

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    
    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 15 }, // Roll Number
      { wch: 25 }, // Student Name
      { wch: 18 }, // Test Type
      { wch: 18 }, // RIASEC Category
      { wch: 18 }, // Aptitude Score
      { wch: 18 }, // Personality Score
      { wch: 28 }, // Personality Interpretation
      { wch: 22 }  // Completed Date
    ];

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Results');

    // Generate buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="All_Students_Results.xlsx"');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));