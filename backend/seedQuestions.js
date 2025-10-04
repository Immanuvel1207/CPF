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
  category: { type: String, enum: ['R', 'I', 'A', 'S', 'E', 'C'], required: true },
  createdAt: { type: Date, default: Date.now }
});

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

const Question = mongoose.model('Question', questionSchema);
const User = mongoose.model('User', userSchema);

// RIASEC Questions mapped from the PDF
const questions = [
  { questionNumber: 1, text: "I like to work on cars", category: "R" },
  { questionNumber: 2, text: "I like to do puzzles", category: "I" },
  { questionNumber: 3, text: "I am good at working independently", category: "A" },
  { questionNumber: 4, text: "I like to work in teams", category: "S" },
  { questionNumber: 5, text: "I am an ambitious person, I set goals for myself", category: "E" },
  { questionNumber: 6, text: "I like to organize things, (files, desks/offices)", category: "C" },
  { questionNumber: 7, text: "I like to build things", category: "R" },
  { questionNumber: 8, text: "I like to read about art and music", category: "I" },
  { questionNumber: 9, text: "I like to have clear instructions to follow", category: "A" },
  { questionNumber: 10, text: "I like to try to influence or persuade people", category: "S" },
  { questionNumber: 11, text: "I like to do experiments", category: "E" },
  { questionNumber: 12, text: "I like to teach or train people", category: "C" },
  { questionNumber: 13, text: "I like trying to help people solve their problems", category: "R" },
  { questionNumber: 14, text: "I like to take care of animals", category: "I" },
  { questionNumber: 15, text: "I wouldn't mind working 8 hours per day in an office", category: "A" },
  { questionNumber: 16, text: "I like selling things", category: "S" },
  { questionNumber: 17, text: "I enjoy creative writing", category: "E" },
  { questionNumber: 18, text: "I enjoy science", category: "C" },
  { questionNumber: 19, text: "I am quick to take on new responsibilities", category: "R" },
  { questionNumber: 20, text: "I am interested in healing people", category: "I" },
  { questionNumber: 21, text: "I enjoy trying to figure out how things work", category: "A" },
  { questionNumber: 22, text: "I like putting things together or assembling things", category: "S" },
  { questionNumber: 23, text: "I am a creative person", category: "E" },
  { questionNumber: 24, text: "I pay attention to details", category: "C" },
  { questionNumber: 25, text: "I like to do filing or typing", category: "R" },
  { questionNumber: 26, text: "I like to analyze things (problems/situations)", category: "I" },
  { questionNumber: 27, text: "I like to play instruments or sing", category: "A" },
  { questionNumber: 28, text: "I enjoy learning about other cultures", category: "S" },
  { questionNumber: 29, text: "I would like to start my own business", category: "E" },
  { questionNumber: 30, text: "I like to cook", category: "C" },
  { questionNumber: 31, text: "I like acting in plays", category: "R" },
  { questionNumber: 32, text: "I am a practical person", category: "I" },
  { questionNumber: 33, text: "I like working with numbers or charts", category: "A" },
  { questionNumber: 34, text: "I like to get into discussions about issues", category: "S" },
  { questionNumber: 35, text: "I am good at keeping records of my work", category: "E" },
  { questionNumber: 36, text: "I like to lead", category: "C" },
  { questionNumber: 37, text: "I like working outdoors", category: "R" },
  { questionNumber: 38, text: "I would like to work in an office", category: "I" },
  { questionNumber: 39, text: "I'm good at math", category: "A" },
  { questionNumber: 40, text: "I like helping people", category: "S" },
  { questionNumber: 41, text: "I like to draw", category: "E" },
  { questionNumber: 42, text: "I like to give speeches", category: "C" }
];

async function seedDatabase() {
  try {
    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Insert questions
    await Question.insertMany(questions);
    console.log('Inserted 42 RIASEC questions');

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
    console.log('Total Questions: 42');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
}

seedDatabase();