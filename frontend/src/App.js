import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NotificationsProvider, { useNotification } from './Notifications';

const API_URL = 'http://localhost:5000/api';

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <NotificationsProvider>
        <Login setUser={setUser} />
      </NotificationsProvider>
    );
  }
  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h1 className="text-lg font-bold">MBA Career Assessment</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:inline">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

        {user.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <StudentDashboard user={user} />
        )}
      </div>
    </NotificationsProvider>
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
      const response = await axios.post(`${API_URL}/login`, { rollNumber, password });
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
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-block bg-indigo-100 p-3 rounded-full mb-3">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Career Assessment</h1>
          <p className="text-gray-600 text-sm">Discover Your Ideal Path</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter roll number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Demo Accounts</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-mono bg-white px-2 py-0.5 rounded">ADMIN001</span> / <span className="font-mono bg-white px-2 py-0.5 rounded">admin123</span></p>
              <p><span className="font-mono bg-white px-2 py-0.5 rounded">MB001</span> / <span className="font-mono bg-white px-2 py-0.5 rounded">student</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ user }) {
  const [view, setView] = useState('home');
  const [profile, setProfile] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setView('home')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            view === 'home' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView('test')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            view === 'test' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Take Assessment
        </button>
        <button
          onClick={() => setView('settings')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            view === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Settings
        </button>
      </div>

      {view === 'home' && <StudentHome profile={profile} />}
      {view === 'test' && (
        !selectedTest ? (
          <TestsList onSelect={(t) => setSelectedTest(t)} />
        ) : (
          <div>
            <div className="mb-4">
              <button onClick={() => setSelectedTest(null)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">← Back to Tests</button>
            </div>
            <TestComponent profile={profile} fetchProfile={fetchProfile} testKey={selectedTest} />
          </div>
        )
      )}
      {view === 'settings' && <StudentSettings />}
    </div>
  );
}

function TestsList({ onSelect }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        // try authenticated endpoint first
        const res = await axios.get(`${API_URL}/tests`);
        setTests(res.data || []);
      } catch (err) {
        console.warn('Authenticated tests fetch failed, trying public endpoint', err?.response?.status);
        // fall back to public endpoint
        try {
          const pub = await axios.get(`${API_URL}/public/tests`);
          setTests(pub.data || []);
        } catch (err2) {
          console.error('Failed to fetch public tests', err2);
          setError(err2.response?.data?.error || 'Failed to load tests.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();

    // also try to fetch profile (optional) to mark completed tests on the cards
    const fetchProfile = async () => {
      try {
        const p = await axios.get(`${API_URL}/user/profile`);
        setProfile(p.data);
      } catch (e) {
        // ignore if unauthenticated or fails — public view still works
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div></div>;
  if (tests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <h3 className="text-lg font-bold mb-2">No tests available</h3>
        <p className="text-sm text-gray-600 mb-4">{error || 'There are no tests configured on the server.'}</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => onSelect('RIASEC')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Take RIASEC (default)</button>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-200 rounded-lg">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tests.map(test => (
        <div key={test.key} className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold">{test.name}</h3>
              {profile && profile.testResults && profile.testResults.some(r => r.test === test.key) && (
                <div className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Completed</div>
              )}
            </div>
            <span className="text-xs text-gray-500">{test.questionCount} Qs</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{test.description}</p>
          <div className="flex justify-end">
            {profile && profile.testResults && profile.testResults.some(r => r.test === test.key) ? (
              <button onClick={() => onSelect(test.key)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg">View Result</button>
            ) : (
              <button onClick={() => onSelect(test.key)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Take Test</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentHome({ profile }) {
  if (!profile) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-600"></div></div>;

  const careerData = {
    'R': { name: 'Realistic', color: 'bg-blue-500', desc: 'Hands-on work with tools and machinery' },
    'I': { name: 'Investigative', color: 'bg-purple-500', desc: 'Analytical and research-oriented' },
    'A': { name: 'Artistic', color: 'bg-pink-500', desc: 'Creative expression and innovation' },
    'S': { name: 'Social', color: 'bg-green-500', desc: 'People-oriented and helping' },
    'E': { name: 'Enterprising', color: 'bg-orange-500', desc: 'Leadership and entrepreneurship' },
    'C': { name: 'Conventional', color: 'bg-gray-500', desc: 'Organized and detail-oriented' }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Your Career Portal</h2>
        <p className="text-gray-600 text-sm">Based on the RIASEC (Holland Code) career assessment model</p>
        
        {/* pick the most recent test result (if any) */}
        {/**/}
        
        {/* derive latest result for display */}
        {/**/}
        
        
        
        <div className="mt-4">
          {profile.hasCompletedTest ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <div>
                <p className="text-green-800 font-semibold">Assessment Completed</p>
                <p className="text-green-700 text-sm">Your career profile is ready below</p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-yellow-800 font-semibold">Ready to Begin?</p>
                <p className="text-yellow-700 text-sm">Click "Take Assessment" to discover your career path</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* display latest result if available */}
      {profile.hasCompletedTest && profile.testResults && profile.testResults.length > 0 && (
        <>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Your Career Profile</h3>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
              <p className="text-3xl font-bold mb-1">{profile.testResults[profile.testResults.length - 1].primaryCareer}</p>
              <p className="text-sm text-white/90">{careerData[profile.testResults[profile.testResults.length - 1].topThree[0]?.split(' ')[0]]?.desc}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {profile.testResults[profile.testResults.length - 1].topThree.slice(0, 3).map((area, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                  <p className="text-xs font-semibold mb-1">#{idx + 1}</p>
                  <p className="text-sm font-bold">{area.split(' - ')[0]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="text-xl font-bold mb-4">Recommended Careers</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {profile.testResults[profile.testResults.length - 1].recommendedCareers?.map((career, idx) => (
                <div key={idx} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-indigo-800">{career}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="text-xl font-bold mb-4">Score Breakdown</h4>
            {Object.entries(profile.testResults[profile.testResults.length - 1].scores).sort(([,a], [,b]) => b - a).map(([code, score]) => {
              const career = careerData[code];
              const maxScore = 7;
              const percentage = (score / maxScore) * 100;
              return (
                <div key={code} className="mb-3">
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="font-semibold">{code} - {career.name}</span>
                    <span className="font-semibold">{score}/{maxScore}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`${career.color} h-3 rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function TestComponent({ profile, fetchProfile, testKey }) {
  const { notify, confirm, celebrate } = useNotification();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const fetchQuestions = React.useCallback(async () => {
    try {
      // fetch questions for a specific test if provided
      const url = `${API_URL}/questions`;
      let response;
      try {
        response = testKey ? await axios.get(url, { params: { test: testKey } }) : await axios.get(url);
      } catch (err) {
        // if authenticated request fails, fall back to public endpoint
        console.warn('Authenticated questions fetch failed, trying public endpoint', err?.response?.status);
        const pubUrl = `${API_URL}/public/questions`;
        response = testKey ? await axios.get(pubUrl, { params: { test: testKey } }) : await axios.get(pubUrl);
      }
      setQuestions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  }, [testKey]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSliderChange = (value) => {
    const currentQuestion = questions[currentIndex];
    setAnswers(prev => ({ ...prev, [currentQuestion._id]: value }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      notify('Please answer all questions', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/submit-test`, { answers, test: testKey });
      setResult(response.data);
      await fetchProfile();
      // celebration on success
      try { celebrate(); } catch (e) { /* ignore if unavailable */ }
    } catch (error) {
      notify('Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // If the user has already completed this specific test, show completed state
  const hasCompletedThisTest = profile?.testResults?.some(r => r.test === testKey);
  if (hasCompletedThisTest && !result) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-5xl mb-3">✓</div>
        <h3 className="text-2xl font-bold mb-2">Assessment Completed</h3>
        <p className="text-gray-600">View your results on the Dashboard</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div></div>;

  if (!loading && questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="text-2xl font-bold mb-2">No questions found for this test</h3>
          <p className="text-gray-600 mb-4">This test currently has no questions on the server.</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-green-500 text-white rounded-xl p-8 text-center">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-3xl font-bold">Assessment Complete!</h2>
          {testKey && <div className="text-sm mt-1 opacity-90">Test: {testKey}</div>}
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Your Results</h3>
          <div className="bg-indigo-50 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-indigo-800 mb-1">Primary Career Type</h4>
            <p className="text-2xl font-bold text-indigo-600">{result.primaryCareer}</p>
          </div>
          <div className="space-y-2 mb-4">
            {result.topThree.map((area, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold">#{idx + 1}: {area}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-800 mb-2">Recommended Careers</h4>
            <div className="grid grid-cols-2 gap-2">
              {result.recommendedCareers.map((career, idx) => (
                <div key={idx} className="text-sm text-blue-700">{career}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const testTitle = testKey || 'Assessment';
  const currentAnswer = answers[currentQuestion._id] || 3;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const sliderLabels = [
    { value: 1, label: 'Strongly Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Agree' },
    { value: 5, label: 'Strongly Agree' }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">{testTitle}</h2>
          <span className="text-sm font-semibold text-indigo-600">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-xs text-gray-600 mt-2">{answeredCount} of {questions.length} answered</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
              {currentQuestion.questionNumber}
            </div>
            <p className="text-lg font-medium text-gray-800 pt-1">{currentQuestion.text}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative px-2">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={currentAnswer}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between mt-3">
              {sliderLabels.map((item) => (
                <div key={item.value} className="text-center flex-1">
                  <div className={`text-xs font-medium ${currentAnswer === item.value ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-300 transition"
          >
            ← Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < questions.length || submitting}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold disabled:opacity-50 shadow-md"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-md"
            >
              Next →
            </button>
          )}
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post(`${API_URL}/change-password`, { oldPassword, newPassword });
      setMessage('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          {message && <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg text-sm">{message}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm">{error}</div>}
          <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 rounded-lg shadow-md">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [view, setView] = useState('students');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setView('students')}
          className={`px-6 py-2 rounded-lg font-medium shadow-md transition ${view === 'students' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
        >
          Student Management
        </button>
        <button
          onClick={() => setView('questions')}
          className={`px-6 py-2 rounded-lg font-medium shadow-md transition ${view === 'questions' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
        >
          Question Bank
        </button>
      </div>
      {view === 'students' && <StudentsManagement />}
      {view === 'questions' && <QuestionsManagement />}
    </div>
  );
}

function StudentsManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingStudent, setViewingStudent] = useState(null);
  const { notify, confirm } = useNotification();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/students`);
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    const ok = await confirm(`Delete student ${name} completely? This cannot be undone.`);
    if (!ok) return;
    try {
      await axios.delete(`${API_URL}/admin/students/${id}`);
      setStudents(students.filter(s => s._id !== id));
      notify('Student deleted successfully', 'success');
    } catch (error) {
      notify('Failed to delete student', 'error');
    }
  };

  const handleResetAssessment = async (id, name) => {
    const ok = await confirm(`Reset assessment for ${name}?`);
    if (!ok) return;
    try {
      await axios.post(`${API_URL}/admin/students/${id}/reset-assessment`);
      fetchStudents();
      notify('Assessment reset successfully', 'success');
    } catch (error) {
      notify('Failed to reset assessment', 'error');
    }
  };
  const downloadResult = (student, result) => {
    const report = `CAREER ASSESSMENT REPORT\n\nStudent Information:\n- Name: ${student.name}\n- Roll Number: ${student.rollNumber}\n- Assessment Date: ${result?.completedAt ? new Date(result.completedAt).toLocaleString() : 'N/A'}\n\nResult (Test: ${result?.test || 'N/A'}):\n- Primary Career Type: ${result?.primaryCareer || 'N/A'}\n- Top Three Types: ${result?.topThree?.join(', ') || 'N/A'}\n\nScore Breakdown:\n${Object.entries(result?.scores || {}).map(([code, score]) => `- ${code}: ${score}`).join('\n')}\n\nRecommended Careers:\n${result?.recommendedCareers?.map(c => `- ${c}`).join('\n') || 'N/A'}`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.rollNumber}_${result.test || 'result'}_career_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadReport = (student) => {
    const latestResult = student.testResults && student.testResults.length ? student.testResults[student.testResults.length - 1] : null;
    if (!latestResult) return notify('No result available to download', 'error');
    downloadResult(student, latestResult);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div></div>;

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Student Management</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700">TOTAL STUDENTS</p>
            <p className="text-3xl font-bold text-blue-600">{students.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs font-semibold text-green-700">COMPLETED</p>
            <p className="text-3xl font-bold text-green-600">{students.filter(s => s.hasCompletedTest).length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-700">PENDING</p>
            <p className="text-3xl font-bold text-yellow-600">{students.filter(s => !s.hasCompletedTest).length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Roll No</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Career Type</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map(student => {
              const latestResult = student.testResults && student.testResults.length ? student.testResults[student.testResults.length - 1] : null;
              return (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{student.rollNumber}</td>
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3">
                    {student.hasCompletedTest ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Completed</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {latestResult ? (
                      <div className="text-xs">
                        <div className="font-semibold text-indigo-600">{latestResult.primaryCareer?.split(' - ')[0]}</div>
                        <div className="text-gray-500">Top: {latestResult.topThree?.map(t => t.split(' ')[0]).join(', ')}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Not available</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {latestResult && (
                        <button
                          onClick={() => downloadResult(student, latestResult)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold"
                          title="Download Report"
                        >
                          Download
                        </button>
                      )}
                      {student.hasCompletedTest && (
                        <button
                          onClick={() => handleResetAssessment(student._id, student.name)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-semibold"
                          title="Reset Assessment"
                        >
                          Reset
                        </button>
                      )}
                      <button
                        onClick={() => setViewingStudent(student)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold"
                        title="View Results"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student._id, student.name)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold"
                        title="Delete Student"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Viewing modal for a selected student (inside StudentsManagement scope) */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Results for {viewingStudent.name}</h3>
              <button onClick={() => setViewingStudent(null)} className="text-gray-500 px-2 py-1">Close</button>
            </div>
            {viewingStudent.testResults && viewingStudent.testResults.length ? (
              <div className="space-y-3 max-h-72 overflow-auto">
                {viewingStudent.testResults.map((r, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{r.test} — {r.primaryCareer}</div>
                        <div className="text-sm text-gray-500">Completed: {new Date(r.completedAt).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => downloadResult(viewingStudent, r)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold">Download</button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="font-semibold">Top Three:</div>
                      <div>{r.topThree?.join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-600">No test results available for this student.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionsManagement() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ questionNumber: '', text: '', category: 'R', test: 'RIASEC' });
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('RIASEC');
  const { notify, confirm } = useNotification();

  useEffect(() => {
    fetchTests();
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/questions`, { params: { test: selectedTest } });
      setQuestions(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/tests`);
      setTests(res.data || []);
      if (res.data && res.data.length && !selectedTest) {
        setSelectedTest(res.data[0].key);
      }
    } catch (err) {
      console.error('Failed to fetch tests for admin', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API_URL}/questions/${editing._id}`, formData);
        notify('Updated successfully', 'success');
      } else {
        await axios.post(`${API_URL}/questions`, formData);
        notify('Added successfully', 'success');
      }
      setFormData({ questionNumber: '', text: '', category: 'R' });
      setShowForm(false);
      setEditing(null);
      fetchQuestions();
    } catch (error) {
      notify('Failed to save', 'error');
    }
  };

  const handleEdit = (q) => {
    setFormData({ questionNumber: q.questionNumber, text: q.text, category: q.category, test: q.test || 'RIASEC' });
    setEditing(q);
    setShowForm(true);
  };

  const handleDelete = async (id, num) => {
    const ok = await confirm(`Delete question ${num}?`);
    if (!ok) return;
    try {
      await axios.delete(`${API_URL}/questions/${id}`);
      setQuestions(questions.filter(q => q._id !== id));
      notify('Deleted successfully', 'success');
    } catch (error) {
      notify('Failed to delete', 'error');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div></div>;

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Question Bank</h2>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex gap-2">
                {tests.map(t => (
                  <button key={t.key} onClick={() => { setSelectedTest(t.key); setLoading(true); setShowForm(false); setEditing(null); setFormData({ questionNumber: '', text: '', category: 'R', test: t.key }); fetchQuestions(); }} className={`px-4 py-2 rounded-lg ${selectedTest === t.key ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>{t.name}</button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) {
                    setEditing(null);
                    setFormData({ questionNumber: '', text: '', category: 'R', test: selectedTest });
                  } else {
                    setFormData({ questionNumber: '', text: '', category: 'R', test: selectedTest });
                  }
                }}
                className={`px-5 py-2 rounded-lg font-semibold ${showForm ? 'bg-gray-600 text-white' : 'bg-green-500 text-white'}`}
              >
                {showForm ? 'Cancel' : '+ Add Question'}
              </button>
            </div>
          </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 bg-indigo-50 p-5 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-sm">Question Number</label>
                <input
                  type="number"
                  value={formData.questionNumber}
                  onChange={(e) => setFormData({...formData, questionNumber: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-sm">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
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
              <label className="block font-semibold mb-1 text-sm">Question Text</label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({...formData, text: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-sm">Test / Domain</label>
              <select
                value={formData.test}
                onChange={(e) => setFormData({...formData, test: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              >
                {/* prefer tests from server, but fallback to common defaults */}
                {tests.length ? tests.map(t => <option key={t.key} value={t.key}>{t.name}</option>) : (
                  <>
                    <option value="RIASEC">RIASEC Career Assessment</option>
                    <option value="Aptitude">Aptitude Test</option>
                    <option value="Personality">Personality Inventory</option>
                  </>
                )}
              </select>
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">
              {editing ? 'Update' : 'Add'} Question
            </button>
          </form>
        )}

        <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="font-semibold text-blue-800 text-sm">Total Questions: {questions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">#</th>
              <th className="px-4 py-3 text-left font-semibold">Question</th>
              <th className="px-4 py-3 text-left font-semibold">Category</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {questions.map(q => (
              <tr key={q._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{q.questionNumber}</td>
                <td className="px-4 py-3">{q.text}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">{q.category}</span>
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => handleEdit(q)} className="bg-indigo-500 text-white px-3 py-1 rounded text-xs font-semibold">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(q._id, q.questionNumber)} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default App;