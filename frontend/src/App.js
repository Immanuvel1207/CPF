import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Axios interceptor for auth token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">MBA Career Assessment</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {user.role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <StudentDashboard user={user} setUser={setUser} />
      )}
    </div>
  );
}

function Login({ setUser }) {
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login`, {
        rollNumber,
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MBA Career Assessment</h1>
          <p className="text-gray-600">Discover Your Ideal Career Path</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roll Number
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your roll number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo Accounts:</p>
          <p className="font-mono">Admin: ADMIN001 / admin123</p>
          <p className="font-mono">Student: MB001 / student</p>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ user, setUser }) {
  const [view, setView] = useState('home');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setView('home')}
          className={`px-6 py-2 rounded-lg transition ${
            view === 'home'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setView('test')}
          className={`px-6 py-2 rounded-lg transition ${
            view === 'test'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Take Test
        </button>
        <button
          onClick={() => setView('settings')}
          className={`px-6 py-2 rounded-lg transition ${
            view === 'settings'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Settings
        </button>
      </div>

      {view === 'home' && <StudentHome profile={profile} />}
      {view === 'test' && <TestComponent profile={profile} fetchProfile={fetchProfile} />}
      {view === 'settings' && <StudentSettings />}
    </div>
  );
}

function StudentHome({ profile }) {
  if (!profile) return <div>Loading...</div>;

  const careerDescriptions = {
    'R': {
      name: 'Realistic',
      description: 'People with Realistic interests like to work with things and tools. They are often good at mechanical or athletic jobs.',
      majors: ['Agriculture', 'Health Assistant', 'Computers', 'Construction', 'Mechanic/Machinist', 'Engineering', 'Food and Hospitality'],
      pathways: ['Natural Resources', 'Health Services', 'Industrial and Engineering Technology', 'Arts and Communication']
    },
    'I': {
      name: 'Investigative',
      description: 'People with Investigative interests like to watch, learn, analyze and solve problems.',
      majors: ['Marine Biology', 'Engineering', 'Chemistry', 'Zoology', 'Medicine/Surgery', 'Consumer Economics', 'Psychology'],
      pathways: ['Health Services', 'Business', 'Public and Human Services', 'Industrial and Engineering Technology']
    },
    'A': {
      name: 'Artistic',
      description: 'People with Artistic interests like to work in unstructured situations where they can use their creativity.',
      majors: ['Communications', 'Cosmetology', 'Fine and Performing Arts', 'Photography', 'Radio and TV', 'Interior Design', 'Architecture'],
      pathways: ['Public and Human Services', 'Arts and Communication']
    },
    'S': {
      name: 'Social',
      description: 'People with Social interests like to work with other people, rather than things.',
      majors: ['Counseling', 'Nursing', 'Physical Therapy', 'Travel', 'Advertising', 'Public Relations', 'Education'],
      pathways: ['Health Services', 'Public and Human Services']
    },
    'E': {
      name: 'Enterprising',
      description: 'People with Enterprising interests like to work with others and enjoy persuading and performing.',
      majors: ['Fashion Merchandising', 'Real Estate', 'Marketing/Sales', 'Law', 'Political Science', 'International Trade', 'Banking/Finance'],
      pathways: ['Business', 'Public and Human Services', 'Arts and Communication']
    },
    'C': {
      name: 'Conventional',
      description: 'People with Conventional interests are very detail oriented, organized and like to work with data.',
      majors: ['Accounting', 'Court Reporting', 'Insurance', 'Administration', 'Medical Records', 'Banking', 'Data Processing'],
      pathways: ['Health Services', 'Business', 'Industrial and Engineering Technology']
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Your Career Assessment Portal</h2>
        <p className="text-gray-600 mb-4">
          This assessment is based on the RIASEC (Holland Code) model, which helps identify your career interests and suggests suitable pathways for your MBA journey.
        </p>
        
        {profile.hasCompletedTest ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">✓ You have completed the assessment!</p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">→ You haven't taken the assessment yet. Click "Take Test" to begin.</p>
          </div>
        )}
      </div>

      {profile.hasCompletedTest && profile.testResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Results</h3>
          
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">Your Scores:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(profile.testResult.scores).map(([code, score]) => (
                <div key={code} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{code}</div>
                  <div className="text-3xl font-bold text-gray-800">{score}</div>
                  <div className="text-sm text-gray-600">{careerDescriptions[code].name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">Your Top Three Interest Areas:</h4>
            <div className="space-y-2">
              {profile.testResult.topThree.map((area, idx) => (
                <div key={idx} className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <span className="font-medium text-indigo-800">{idx + 1}. {area}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg">
            <h4 className="font-semibold mb-2">Your Primary Career Profile:</h4>
            <p className="text-2xl font-bold mb-4">{profile.testResult.primaryCareer}</p>
            {profile.testResult.topThree[0] && (
              <div className="mt-4">
                <p className="mb-3">{careerDescriptions[profile.testResult.topThree[0].split(' ')[0]].description}</p>
                <div className="bg-white/20 p-4 rounded">
                  <p className="font-semibold mb-2">Recommended Majors:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {careerDescriptions[profile.testResult.topThree[0].split(' ')[0]].majors.map((major, idx) => (
                      <li key={idx}>{major}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">About the RIASEC Assessment</h3>
        <p className="text-gray-600 mb-4">
          The RIASEC model identifies six personality types: Realistic, Investigative, Artistic, Social, Enterprising, and Conventional. Understanding your personality type helps you make informed decisions about your career path and specialization in MBA.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(careerDescriptions).map(([code, data]) => (
            <div key={code} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <h4 className="font-bold text-indigo-600 mb-2">{code} - {data.name}</h4>
              <p className="text-sm text-gray-600">{data.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestComponent({ profile, fetchProfile }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/questions`);
      setQuestions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/submit-test`, { answers });
      setResult(response.data);
      await fetchProfile();
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (profile?.hasCompletedTest && !result) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Test Already Completed</h3>
        <p className="text-gray-600 mb-4">You have already completed the career assessment. Your results are displayed on the Home page.</p>
        <p className="text-sm text-gray-500">If you need to retake the test, please contact the administrator.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading questions...</div>;
  }

  if (result) {
    return <TestResults result={result} />;
  }

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Career Assessment Test</h2>
        <p className="text-gray-600 mb-4">
          Read each statement carefully. If you agree with the statement, check the box. There are no wrong answers!
        </p>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{answeredCount} / {questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, idx) => (
          <div key={question._id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={answers[question._id] || false}
                onChange={(e) => handleAnswerChange(question._id, e.target.checked)}
                className="mt-1 mr-3 h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-800">
                <span className="font-semibold">{question.questionNumber}.</span> {question.text}
              </span>
            </label>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <button
          onClick={handleSubmit}
          disabled={submitting || answeredCount < questions.length}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Test'}
        </button>
        {answeredCount < questions.length && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Please answer all {questions.length} questions to submit
          </p>
        )}
      </div>
    </div>
  );
}

function TestResults({ result }) {
  const careerInfo = {
    'R': { name: 'Realistic', color: 'bg-blue-500', description: 'You enjoy working with your hands, tools, and machinery. You prefer practical, hands-on work.' },
    'I': { name: 'Investigative', color: 'bg-purple-500', description: 'You enjoy solving problems, analyzing data, and conducting research. You prefer intellectual challenges.' },
    'A': { name: 'Artistic', color: 'bg-pink-500', description: 'You enjoy creative expression, innovation, and working in unstructured environments.' },
    'S': { name: 'Social', color: 'bg-green-500', description: 'You enjoy helping others, teaching, and working in teams. You prefer people-oriented activities.' },
    'E': { name: 'Enterprising', color: 'bg-yellow-500', description: 'You enjoy leading, persuading, and taking risks. You prefer business and entrepreneurial activities.' },
    'C': { name: 'Conventional', color: 'bg-gray-500', description: 'You enjoy organization, data management, and following procedures. You prefer structured environments.' }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">🎉 Assessment Complete!</h2>
        <p className="text-lg">Your career profile has been generated based on your responses.</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Results</h3>
        
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Score Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(result.scores)
              .sort(([, a], [, b]) => b - a)
              .map(([code, score]) => (
                <div key={code} className="flex items-center">
                  <div className="w-24 font-semibold text-gray-700">{code} - {careerInfo[code].name}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-6 relative">
                      <div
                        className={`${careerInfo[code].color} h-6 rounded-full flex items-center justify-end pr-2 transition-all`}
                        style={{ width: `${(score / 7) * 100}%` }}
                      >
                        <span className="text-white text-sm font-bold">{score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
          <h4 className="text-xl font-bold text-indigo-800 mb-4">Your Primary Career Type</h4>
          <p className="text-2xl font-bold text-indigo-600 mb-4">{result.primaryCareer}</p>
          {result.topThree[0] && (
            <p className="text-gray-700">{careerInfo[result.topThree[0].split(' ')[0]].description}</p>
          )}
        </div>

        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">Your Top Three Interest Areas</h4>
          <div className="space-y-2">
            {result.topThree.map((area, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span className="font-medium text-gray-800">{idx + 1}. {area}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>Next Steps:</strong> Review your results on the Home page for detailed career recommendations, suitable majors, and career pathways aligned with your profile.
          </p>
        </div>
      </div>
    </div>
  );
}

function StudentSettings() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await axios.post(`${API_URL}/change-password`, {
        oldPassword,
        newPassword
      });
      setMessage('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Change Password</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [view, setView] = useState('students');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setView('students')}
          className={`px-6 py-2 rounded-lg transition ${
            view === 'students'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Students
        </button>
        <button
          onClick={() => setView('questions')}
          className={`px-6 py-2 rounded-lg transition ${
            view === 'questions'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Questions
        </button>
      </div>

      {view === 'students' && <StudentsManagement />}
      {view === 'questions' && <QuestionsManagement />}
    </div>
  );
}

function StudentsManagement() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/students`);
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchStudents();
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/admin/students/search?query=${searchQuery}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error searching students:', error);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the record for ${name}?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/admin/students/${id}`);
      setStudents(students.filter(s => s._id !== id));
      alert('Student record deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student record');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading students...</div>;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Management</h2>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name or roll number..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
          >
            Search
          </button>
          <button
            onClick={fetchStudents}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.hasCompletedTest ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {student.testResult ? (
                        <div>
                          <div className="font-medium">{student.testResult.primaryCareer}</div>
                          <div className="text-xs text-gray-500">
                            {student.testResult.topThree.join(', ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(student._id, student.name)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-600">
          <strong>Total Students:</strong> {students.length} | 
          <strong className="ml-4">Completed:</strong> {students.filter(s => s.hasCompletedTest).length} | 
          <strong className="ml-4">Pending:</strong> {students.filter(s => !s.hasCompletedTest).length}
        </div>
      </div>
    </div>
  );
}

function QuestionsManagement() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    questionNumber: '',
    text: '',
    category: 'R'
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/questions`);
      setQuestions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingQuestion) {
        await axios.put(`${API_URL}/questions/${editingQuestion._id}`, formData);
        alert('Question updated successfully');
      } else {
        await axios.post(`${API_URL}/questions`, formData);
        alert('Question added successfully');
      }
      
      setFormData({ questionNumber: '', text: '', category: 'R' });
      setShowAddForm(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question');
    }
  };

  const handleEdit = (question) => {
    setFormData({
      questionNumber: question.questionNumber,
      text: question.text,
      category: question.category
    });
    setEditingQuestion(question);
    setShowAddForm(true);
  };

  const handleDelete = async (id, questionNumber) => {
    if (!window.confirm(`Are you sure you want to delete question ${questionNumber}?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/questions/${id}`);
      setQuestions(questions.filter(q => q._id !== id));
      alert('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  const handleCancel = () => {
    setFormData({ questionNumber: '', text: '', category: 'R' });
    setShowAddForm(false);
    setEditingQuestion(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading questions...</div>;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Question Management</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
          >
            {showAddForm ? 'Cancel' : '+ Add Question'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="border-t pt-4 mt-4 space-y-4">
            <h3 className="font-semibold text-gray-700">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Number
                </label>
                <input
                  type="number"
                  value={formData.questionNumber}
                  onChange={(e) => setFormData({...formData, questionNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (RIASEC)
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="R">R - Realistic</option>
                  <option value="I">I - Investigative</option>
                  <option value="A">A - Artistic</option>
                  <option value="S">S - Social</option>
                  <option value="E">E - Enterprising</option>
                  <option value="C">C - Conventional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({...formData, text: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
              >
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
              {editingQuestion && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map(question => (
                <tr key={question._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {question.questionNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {question.text}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                      {question.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(question._id, question.questionNumber)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-600">
          <strong>Total Questions:</strong> {questions.length}
        </div>
      </div>
    </div>
  );
}

export default App;