const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/mba-career-assessment';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const questionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  text: { type: String, required: true },
  category: { type: String, enum: ['R', 'I', 'A', 'S', 'E', 'C'], required: function() { return (this.test || 'RIASEC') === 'RIASEC'; } },
  test: { type: String, required: true, default: 'RIASEC' },
  options: { type: [String], default: undefined },
  correctAnswer: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  year: { type: Number },  
  hasCompletedTest: { type: Boolean, default: false },
  // keep array of per-test results (align with server schema)
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
      score: Number,
      questionCount: Number,
      interpretation: String,
      feedback: String,
      correct: Number,
      total: Number,
      factors: mongoose.Schema.Types.Mixed,
      factorFeedback: mongoose.Schema.Types.Mixed,
      globalScore: Number,
      globalLevel: String,
      globalFeedback: String,
      completedAt: Date
    }
  ]
});

const Question = mongoose.model('Question', questionSchema);
const User = mongoose.model('User', userSchema);

// RIASEC Questions mapped from the PDF
// We'll include a `test` property to group questions into test subjects
const questions = [
  // RIASEC questions (42) - Pattern: R, I, A, S, E, C repeating (7 questions per category)
  { questionNumber: 1, text: "I like to work on cars", category: "R", test: 'RIASEC' },
  { questionNumber: 2, text: "I like to do puzzles", category: "I", test: 'RIASEC' },
  { questionNumber: 3, text: "I am good at working independently", category: "A", test: 'RIASEC' },
  { questionNumber: 4, text: "I like to work in teams", category: "S", test: 'RIASEC' },
  { questionNumber: 5, text: "I am an ambitious person, I set goals for myself", category: "E", test: 'RIASEC' },
  { questionNumber: 6, text: "I like to organize things, (files, desks/offices)", category: "C", test: 'RIASEC' },
  { questionNumber: 7, text: "I like to build things", category: "R", test: 'RIASEC' },
  { questionNumber: 8, text: "I like to read about art and music", category: "I", test: 'RIASEC' },
  { questionNumber: 9, text: "I like to have clear instructions to follow", category: "A", test: 'RIASEC' },
  { questionNumber: 10, text: "I like to try to influence or persuade people", category: "S", test: 'RIASEC' },
  { questionNumber: 11, text: "I like to do experiments", category: "E", test: 'RIASEC' },
  { questionNumber: 12, text: "I like to teach or train people", category: "C", test: 'RIASEC' },
  { questionNumber: 13, text: "I like trying to help people solve their problems", category: "S", test: 'RIASEC' },
  { questionNumber: 14, text: "I like to take care of animals", category: "R", test: 'RIASEC' },
  { questionNumber: 15, text: "I wouldn't mind working 8 hours per day in an office", category: "C", test: 'RIASEC' },
  { questionNumber: 16, text: "I like selling things", category: "E", test: 'RIASEC' },
  { questionNumber: 17, text: "I enjoy creative writing", category: "A", test: 'RIASEC' },
  { questionNumber: 18, text: "I enjoy science", category: "I", test: 'RIASEC' },
  { questionNumber: 19, text: "I am quick to take on new responsibilities", category: "E", test: 'RIASEC' },
  { questionNumber: 20, text: "I am interested in healing people", category: "S", test: 'RIASEC' },
  { questionNumber: 21, text: "I enjoy trying to figure out how things work", category: "I", test: 'RIASEC' },
  { questionNumber: 22, text: "I like putting things together or assembling things", category: "R", test: 'RIASEC' },
  { questionNumber: 23, text: "I am a creative person", category: "A", test: 'RIASEC' },
  { questionNumber: 24, text: "I pay attention to details", category: "C", test: 'RIASEC' },
  { questionNumber: 25, text: "I like to do filing or typing", category: "C", test: 'RIASEC' },
  { questionNumber: 26, text: "I like to analyze things (problems/situations)", category: "I", test: 'RIASEC' },
  { questionNumber: 27, text: "I like to play instruments or sing", category: "A", test: 'RIASEC' },
  { questionNumber: 28, text: "I enjoy learning about other cultures", category: "S", test: 'RIASEC' },
  { questionNumber: 29, text: "I would like to start my own business", category: "E", test: 'RIASEC' },
  { questionNumber: 30, text: "I like to cook", category: "R", test: 'RIASEC' },
  { questionNumber: 31, text: "I like acting in plays", category: "A", test: 'RIASEC' },
  { questionNumber: 32, text: "I am a practical person", category: "R", test: 'RIASEC' },
  { questionNumber: 33, text: "I like working with numbers or charts", category: "C", test: 'RIASEC' },
  { questionNumber: 34, text: "I like to get into discussions about issues", category: "S", test: 'RIASEC' },
  { questionNumber: 35, text: "I am good at keeping records of my work", category: "C", test: 'RIASEC' },
  { questionNumber: 36, text: "I like to lead", category: "E", test: 'RIASEC' },
  { questionNumber: 37, text: "I like working outdoors", category: "R", test: 'RIASEC' },
  { questionNumber: 38, text: "I would like to work in an office", category: "C", test: 'RIASEC' },
  { questionNumber: 39, text: "I'm good at math", category: "I", test: 'RIASEC' },
  { questionNumber: 40, text: "I like helping people", category: "S", test: 'RIASEC' },
  { questionNumber: 41, text: "I like to draw", category: "A", test: 'RIASEC' },
  { questionNumber: 42, text: "I like to give speeches", category: "E", test: 'RIASEC' },
  
  // Emotional Intelligence (TEIQue-SF) questions - 30 items, 7-point scale
  { questionNumber: 1, text: "Expressing my emotions with words is not a problem for me.", test: 'EI' },
  { questionNumber: 2, text: "I often find it difficult to see things from another person's viewpoint.", test: 'EI' },
  { questionNumber: 3, text: "On the whole, I'm a highly motivated person.", test: 'EI' },
  { questionNumber: 4, text: "I usually find it difficult to regulate my emotions.", test: 'EI' },
  { questionNumber: 5, text: "I generally don't find life enjoyable.", test: 'EI' },
  { questionNumber: 6, text: "I can deal effectively with people.", test: 'EI' },
  { questionNumber: 7, text: "I tend to change my mind frequently.", test: 'EI' },
  { questionNumber: 8, text: "Many times, I can't figure out what emotion I'm feeling.", test: 'EI' },
  { questionNumber: 9, text: "I feel that I have a number of good qualities.", test: 'EI' },
  { questionNumber: 10, text: "I often find it difficult to stand up for my rights.", test: 'EI' },
  { questionNumber: 11, text: "I'm usually able to influence the way other people feel.", test: 'EI' },
  { questionNumber: 12, text: "On the whole, I have a gloomy perspective on most things.", test: 'EI' },
  { questionNumber: 13, text: "Those close to me often complain that I don't treat them right.", test: 'EI' },
  { questionNumber: 14, text: "I often find it difficult to adjust my life according to the circumstances.", test: 'EI' },
  { questionNumber: 15, text: "On the whole, I'm able to deal with stress.", test: 'EI' },
  { questionNumber: 16, text: "I often find it difficult to show my affection to those close to me.", test: 'EI' },
  { questionNumber: 17, text: "I'm normally able to \"get into someone's shoes\" and experience their emotions.", test: 'EI' },
  { questionNumber: 18, text: "I normally find it difficult to keep myself motivated.", test: 'EI' },
  { questionNumber: 19, text: "I'm usually able to find ways to control my emotions when I want to.", test: 'EI' },
  { questionNumber: 20, text: "On the whole, I'm pleased with my life.", test: 'EI' },
  { questionNumber: 21, text: "I would describe myself as a good negotiator.", test: 'EI' },
  { questionNumber: 22, text: "I tend to get involved in things I later wish I could get out of.", test: 'EI' },
  { questionNumber: 23, text: "I often pause and think about my feelings.", test: 'EI' },
  { questionNumber: 24, text: "I believe I'm full of personal strengths.", test: 'EI' },
  { questionNumber: 25, text: "I tend to \"back down\" even if I know I'm right.", test: 'EI' },
  { questionNumber: 26, text: "I don't seem to have any power at all over other people's feelings.", test: 'EI' },
  { questionNumber: 27, text: "I generally believe that things will work out fine in my life.", test: 'EI' },
  { questionNumber: 28, text: "I find it difficult to bond well even with those close to me.", test: 'EI' },
  { questionNumber: 29, text: "Generally, I'm able to adapt to new environments.", test: 'EI' },
  { questionNumber: 30, text: "Others admire me for being relaxed.", test: 'EI' }
  
  // Aptitude test (sample questions)
  ,{ questionNumber: 1, text: "I can solve basic algebraic equations", category: "A", test: 'Aptitude' },
  { questionNumber: 2, text: "I can quickly identify patterns in numbers", category: "A", test: 'Aptitude' },
  { questionNumber: 3, text: "I enjoy logical puzzles and brainteasers", category: "A", test: 'Aptitude' },

  // Personality test (sample questions)
  { questionNumber: 1, text: "I enjoy meeting new people", category: "S", test: 'Personality' },
  { questionNumber: 2, text: "I prefer planning ahead to being spontaneous", category: "C", test: 'Personality' },
  { questionNumber: 3, text: "I feel comfortable taking the lead in group situations", category: "E", test: 'Personality' }
];

async function seedDatabase() {
  try {
    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Insert questions
    // Ensure every question has a `test` property (default to 'RIASEC')
    const prepared = questions.map(q => ({ ...q, test: q.test || 'RIASEC' }));
    await Question.insertMany(prepared);
    console.log(`Inserted ${prepared.length} total questions`);

    // Create default admin account
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.findOneAndUpdate(
      { rollNumber: 'ADMIN001' },
      {
        rollNumber: 'ADMIN001',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'admin'
      },
      { upsert: true, new: true }
    );
    console.log('Created default admin account (ADMIN001 / admin123)');

    // Create sample student accounts
    const sampleStudents = [
      { rollNumber: 'MB001', name: 'Student Demo', password: 'student' }
    ];

    for (const student of sampleStudents) {
      const hashedStudentPassword = await bcrypt.hash(student.password, 10);
      await User.findOneAndUpdate(
        { rollNumber: student.rollNumber },
        {
          rollNumber: student.rollNumber,
          name: student.name,
          password: hashedStudentPassword,
          role: 'student'
        },
        { upsert: true, new: true }
      );
    }
    console.log('Created sample student accounts');

    console.log('\n=== Database Seeded Successfully ===');
    console.log('Admin Login: ADMIN001 / admin123');
    console.log('Student Login: MB001 / student');
    console.log('Total Questions: 42 RIASEC + 30 EI + 3 Aptitude + Personality');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
}

seedDatabase();