import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NotificationsProvider, { useNotification } from './Notifications';
import './App.css';
import logo from './logo.jpeg';

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
              <h1 className="text-lg font-bold">Core Assessment - Career Test (Holland  code - based)</h1>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex">
      {/* Left Side - College Logo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          <img 
                src={logo}
                alt="College Logo" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
          <h1 className="text-4xl font-bold mb-4 mt-4">Student counselling Cell</h1>
          <h2 className="text-4xl font-bold mb-4">Student Wellbeing Assessment Framework</h2>
          <p className="text-lg text-white/90 mb-6">Discover your ideal career path with our comprehensive assessment tools</p>
          <div className="space-y-2 text-sm text-white/80">
            <p></p>
            <p></p>
            <p></p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12">
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
  const careerData = {
    'R': { name: 'Realistic', color: 'bg-blue-500', desc: 'Hands-on work with tools and machinery' },
    'I': { name: 'Investigative', color: 'bg-purple-500', desc: 'Analytical and research-oriented' },
    'A': { name: 'Artistic', color: 'bg-pink-500', desc: 'Creative expression and innovation' },
    'S': { name: 'Social', color: 'bg-green-500', desc: 'People-oriented and helping' },
    'E': { name: 'Enterprising', color: 'bg-orange-500', desc: 'Leadership and entrepreneurship' },
    'C': { name: 'Conventional', color: 'bg-gray-500', desc: 'Organized and detail-oriented' }
  };
  
  if (!profile) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  const testResults = profile?.testResults || [];
  const sortedTestResults = [...testResults].sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
  const riasecResults = sortedTestResults.filter(r => r.test === 'RIASEC');
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Your Career Portal</h2>
        <p className="text-gray-600 text-sm">Based on the RIASEC (Holland Code) career assessment model</p>

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

      {/* RIASEC summary: show top 1 large and next 2 smaller */}
      {profile.hasCompletedTest && riasecResults.length > 0 && (() => {
        const latest = riasecResults[0];
        const scores = latest?.scores || {};
        const sorted = Object.entries(scores).sort(([,a],[,b]) => b - a);
        const topThree = sorted.slice(0,3).map(([code]) => code);
        const [top1, top2, top3] = topThree;
        const top1Label = `${top1} - ${careerData[top1]?.name || ''}`;
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-lg bg-white/10 flex items-center justify-center text-4xl font-bold">{top1}</div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold">{top1Label}</h3>
                  <p className="text-sm opacity-90 mt-1">{careerData[top1]?.desc}</p>
                  <div className="mt-4 space-y-1">
                    <div className="text-xs opacity-90 font-semibold mb-2">Preferred Tasks:</div>
                    {(latest.recommendedCareers || []).slice(0,4).map((c, i) => (
                      <div key={i} className="text-sm opacity-95 flex items-start gap-2">
                        <span>•</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[top2, top3].filter(Boolean).map((code) => (
                <div key={code} className="bg-white rounded-xl shadow p-5">
                  <div className="text-xs text-gray-500">{careerData[code]?.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{careerData[code]?.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* When only non-RIASEC tests exist, show their result plus a prompt to take RIASEC */}
      {profile.hasCompletedTest && riasecResults.length === 0 && sortedTestResults.length > 0 && (() => {
        const latest = sortedTestResults[0];

        // Personality summary card
        if (latest.test === 'Personality') {
          const getNum = (v) => (v !== undefined && v !== null && !isNaN(Number(v)) ? Number(v) : null);
          const score = getNum(latest.score) ?? getNum(latest.total) ?? getNum(latest.correct);
          const questionCount = getNum(latest.questionCount);
          const interpretation = latest.interpretation || '';
          const feedback = latest.feedback || '';
          let scoreRange = '';
          if (questionCount) {
            scoreRange = questionCount >= 14
              ? `WEMWBS (14-item): ${score ?? '—'}/70`
              : `SWEMWBS (7-item): ${score ?? '—'}/35`;
          } else {
            scoreRange = score != null ? `Score: ${score}` : 'Score not available';
          }

          return (
            <>
              <div className="bg-white rounded-xl shadow-md p-6 border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 text-2xl">😊</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">Personality Inventory Result</h3>
                    <p className="text-sm text-gray-600 mt-1">{scoreRange}</p>
                    <p className="text-md font-semibold text-purple-700 mt-2">{interpretation}</p>
                    <div className="mt-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">{feedback}</div>
                    <div className="text-xs text-gray-500 mt-3">Completed: {new Date(latest.completedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">ℹ️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-yellow-800">RIASEC result not available yet</h3>
                    <p className="text-sm text-yellow-700 mt-1">Take the Career Interest (RIASEC) test to unlock the full career dashboard with top matches and task preferences.</p>
                    <div className="mt-3 text-xs text-yellow-700">Last test completed: {new Date(latest.completedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </>
          );
        }

        // Aptitude summary card
        if (latest.test === 'Aptitude') {
          const score = latest.score || latest.correct || 0;
          const total = latest.total || latest.totalQuestions || 0;
          return (
            <>
              <div className="bg-white rounded-xl shadow-md p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-2xl">🧠</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">Aptitude Test Result</h3>
                    <p className="text-md font-semibold text-blue-700 mt-2">Score: {score} / {total}</p>
                    <div className="text-xs text-gray-500 mt-3">Completed: {new Date(latest.completedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">ℹ️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-yellow-800">RIASEC result not available yet</h3>
                    <p className="text-sm text-yellow-700 mt-1">Take the Career Interest (RIASEC) test to unlock the full career dashboard with top matches and task preferences.</p>
                    <div className="mt-3 text-xs text-yellow-700">Last test completed: {new Date(latest.completedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </>
          );
        }

        // Emotional Intelligence summary card
        if (latest.test === 'EI') {
          const factorData = latest.factorFeedback || latest.factors || {};
          const globalScore = latest.globalScore ?? 0;
          const globalLevel = latest.globalLevel || 'Average';
          
          return (
            <>
              <div className="bg-white rounded-xl shadow-md p-6 border border-teal-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-teal-100 text-teal-700 text-2xl">💭</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">Emotional Intelligence (TEIQue-SF) Result</h3>
                    <div className="mt-2 p-3 bg-teal-50 rounded-lg">
                      <p className="text-sm font-semibold text-teal-700">Global EI Score: <span className="text-xl text-teal-800">{typeof globalScore === 'number' ? globalScore.toFixed(2) : globalScore}</span> / 7.0</p>
                      <p className="text-sm font-semibold text-teal-700">Level: <span className="text-teal-800">{globalLevel}</span></p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {Object.entries(factorData).map(([factor, data]) => {
                        const scoreValue = typeof data === 'object' && data.score ? data.score : data;
                        const displayScore = typeof scoreValue === 'number' ? scoreValue.toFixed(2) : parseFloat(scoreValue).toFixed(2);
                        return (
                          <div key={factor} className="bg-gray-50 p-2 rounded">
                            <p className="text-xs font-semibold text-gray-700">{factor}</p>
                            <p className="text-sm font-bold text-teal-600">{displayScore}</p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-3">Completed: {new Date(latest.completedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </>
          );

        }

        // Generic fallback
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="text-3xl">ℹ️</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-800">RIASEC result not available yet</h3>
                <p className="text-sm text-yellow-700 mt-1">Your latest completed test is {latest.test}. Take the Career Interest (RIASEC) test to see the full dashboard with career matches.</p>
                <div className="mt-3 text-xs text-yellow-700">Last test completed: {new Date(latest.completedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Detailed RIASEC breakdown (top three only) */}
      {riasecResults.length > 0 && (() => {
        const latest = riasecResults[0];
        const maxPossibleScore = 35;
        const topThree = Object.entries(latest?.scores || {})
          .sort(([,a],[,b])=>b-a)
          .slice(0,3);
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThree.map(([code, score]) => {
              const career = careerData[code];
              const numScore = Number(score) || 0;
              return (
                <div key={code} className="bg-white rounded-xl shadow p-5">
                  <div className="text-xs text-gray-500">{career.name}</div>
                  <div className="text-3xl font-bold mt-2 text-indigo-600">{numScore}<span className="text-xl text-gray-400">/{maxPossibleScore}</span></div>
                  <p className="text-sm text-gray-500 mt-3">{career.desc}</p>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Latest test result (any test) to surface Personality/Aptitude clearly */}
      {sortedTestResults.length > 0 && (() => {
        const latestAny = sortedTestResults[0];

        if (latestAny.test === 'Personality') {
          const getNum = (v) => (v !== undefined && v !== null && !isNaN(Number(v)) ? Number(v) : null);
          const score = getNum(latestAny.score) ?? getNum(latestAny.total) ?? getNum(latestAny.correct);
          const questionCount = getNum(latestAny.questionCount);
          const interpretation = latestAny.interpretation || '';
          const feedback = latestAny.feedback || '';
          const scoreRange = questionCount
            ? (questionCount >= 14 ? `WEMWBS (14-item): ${score ?? '—'}/70` : `SWEMWBS (7-item): ${score ?? '—'}/35`)
            : (score != null ? `Score: ${score}` : 'Score not available');

          return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-purple-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 text-2xl">😊</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Latest Test: Personality Inventory</h3>
                      <p className="text-sm text-gray-600 mt-1">{scoreRange}</p>
                      <p className="text-md font-semibold text-purple-700 mt-2">{interpretation}</p>
                    </div>
                    <div className="text-xs text-gray-500">{new Date(latestAny.completedAt).toLocaleString()}</div>
                  </div>
                  <div className="mt-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">{feedback}</div>
                </div>
              </div>
            </div>
          );
        }

        if (latestAny.test === 'Aptitude') {
          const score = latestAny.score || latestAny.correct || 0;
          const total = latestAny.total || latestAny.totalQuestions || 0;
          return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-2xl">🧠</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Latest Test: Aptitude</h3>
                      <p className="text-md font-semibold text-blue-700 mt-2">Score: {score} / {total}</p>
                    </div>
                    <div className="text-xs text-gray-500">{new Date(latestAny.completedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // If latest is RIASEC, rely on the main RIASEC cards already shown; no extra card needed.
        return null;
      })()}

      {/* Test history: show all saved test results */}
      {sortedTestResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h4 className="text-xl font-bold mb-4">Test History</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedTestResults.map((r, idx) => {
              const isPersonality = r.test === 'Personality';
              const isAptitude = r.test === 'Aptitude';
              const isEI = r.test === 'EI';
              const getNum = (v) => (v !== undefined && v !== null && !isNaN(Number(v)) ? Number(v) : null);
              const qc = getNum(r.questionCount);
              const sVal = getNum(r.score) ?? getNum(r.total) ?? getNum(r.correct);
              
              const titleText = isPersonality 
                ? `${r.test} (${qc && qc >= 14 ? 'WEMWBS' : 'SWEMWBS'})` 
                : isAptitude 
                ? `${r.test}` 
                : isEI
                ? `${r.test} — ${r.globalLevel || 'Completed'} EI`
                : `${r.test} — ${r.primaryCareer}`;
              
              const scoreText = isPersonality 
                ? (qc ? `Score: ${sVal ?? '—'}/${qc >= 14 ? 70 : 35}` : (sVal != null ? `Score: ${sVal}` : 'Score: —')) 
                : isAptitude 
                ? `Score: ${sVal ?? '—'}/${getNum(r.total) ?? getNum(r.totalQuestions) ?? '—'}` 
                : isEI
                ? (r.globalScore !== undefined && r.globalScore !== null ? `Global Score: ${typeof r.globalScore === 'number' ? r.globalScore.toFixed(2) : r.globalScore}/7.0` : 'Global Score: —/7.0')
                : `Top: ${r.topThree?.map(t => t.split(' - ')[0]).join(', ')}`;

              
              return (
                <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{titleText}</div>
                      <div className="text-sm text-gray-500">Completed: {new Date(r.completedAt).toLocaleString()}</div>
                      <div className="mt-2 text-sm">{scoreText}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => downloadResultForUser(r, profile)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold">Download</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function downloadResultForUser(result, profile) {
  const roll = profile?.rollNumber || 'N/A';
  const name = profile?.name || 'N/A';
  const test = result?.test || 'N/A';

  // Build content based on test type
  let lines = [];
  lines.push(`Career Assessment Report`);
  lines.push(``);
  lines.push(`Student: ${name} (${roll})`);
  lines.push(`Test: ${test}`);
  lines.push(`Completed: ${result?.completedAt ? new Date(result.completedAt).toLocaleString() : 'N/A'}`);
  lines.push(``);

  if (test === 'RIASEC') {
    const scores = result?.scores || {};
    const topThree = Object.entries(scores).sort(([,a],[,b]) => b-a).slice(0,3).map(([c]) => c);
    const recs = result?.recommendedCareers || [];
    lines.push(`Top Matches: ${topThree.join(', ')}`);
    lines.push(`Scores:`);
    Object.entries(scores).forEach(([code, score]) => lines.push(`- ${code}: ${score} / 35`));
    if (recs.length) {
      lines.push(``);
      lines.push(`Suggestions:`);
      recs.forEach(s => lines.push(`- ${s}`));
    }
  } else if (test === 'EI') {
    const factorData = result?.factorFeedback || result?.factors || {};
    const globalScore = result?.globalScore;
    const globalLevel = result?.globalLevel;
    
    if (globalScore !== undefined && globalScore !== null) {
      const scoreNum = typeof globalScore === 'number' ? globalScore : parseFloat(globalScore);
      lines.push(`Global EI Score: ${scoreNum.toFixed(2)} / 7.0`);
    } else {
      lines.push(`Global EI Score: Data not available`);
    }
    
    if (globalLevel) {
      lines.push(`Level: ${globalLevel}`);
    } else {
      lines.push(`Level: Assessment complete`);
    }
    
    lines.push(``);
    lines.push(`Factor Scores:`);
    
    if (Object.keys(factorData).length > 0) {
      Object.entries(factorData).forEach(([factor, data]) => {
        const scoreValue = typeof data === 'object' && data.score ? data.score : data;
        const numScore = typeof scoreValue === 'number' ? scoreValue : parseFloat(scoreValue);
        if (!isNaN(numScore)) {
          lines.push(`- ${factor}: ${numScore.toFixed(2)} / 7.0`);
        } else {
          lines.push(`- ${factor}: Data not available`);
        }
      });
    } else {
      lines.push(`- Factor data not available`);
    }
    
    if (result?.globalFeedback) {
      lines.push(``);
      lines.push(`Overall Assessment:`);
      lines.push(result.globalFeedback);
    }
  } else if (test === 'Personality') {
    const score = result?.score ?? result?.total ?? result?.correct ?? 'N/A';
    const qCount = result?.questionCount || 0;
    const range = qCount >= 14 ? 70 : 35;
    lines.push(`Score: ${score} / ${range}`);
    if (result?.interpretation) lines.push(`Interpretation: ${result.interpretation}`);
    if (result?.feedback) {
      lines.push(``);
      lines.push(`Suggestions:`);
      lines.push(result.feedback);
    }
  } else if (test === 'Aptitude') {
    const score = result?.score ?? result?.correct ?? 0;
    const total = result?.total ?? result?.totalQuestions ?? 'N/A';
    lines.push(`Score: ${score} / ${total}`);
  } else {
    lines.push(`Result data not available.`);
  }

  // Generate PDF via jsPDF (loaded via public/index.html)
  try {
    const doc = new window.jspdf.jsPDF();
    const margin = 14;
    let y = margin;
    doc.setFontSize(16);
    doc.text(lines[0], margin, y);
    doc.setFontSize(11);
    y += 8;
    lines.slice(1).forEach(line => {
      const split = doc.splitTextToSize(line, 180);
      split.forEach(chunk => {
        doc.text(chunk, margin, y);
        y += 6;
        if (y > 280) { doc.addPage(); y = margin; }
      });
    });
    doc.save(`${roll}_${test}_report.pdf`);
  } catch (e) {
    // Fallback to text if PDF fails
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roll}_${test}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

function TestComponent({ profile, fetchProfile, testKey }) {
  const { notify, celebrate } = useNotification();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [visitedQuestions, setVisitedQuestions] = useState({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [readyToStart, setReadyToStart] = useState(false);

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
      // Do NOT initialize slider-based tests (RIASEC, Personality, EI) - they need explicit user interaction
      // Only initialize Aptitude with 0 values for MCQ radio buttons
      if ((testKey && testKey === 'Aptitude') && response.data && response.data.length) {
        const init = {};
        response.data.forEach(q => { init[q._id] = 0; });
        setAnswers(init);
      }
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

  const handleRangeClick = (e) => {
    // compute value based on click position so clicking the track sets value even if same as current
    const el = e.target;
    const rect = el.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const min = Number(el.min) || 1;
    const max = Number(el.max) || 5;
    const value = Math.round(ratio * (max - min) + min);
    handleSliderChange(value);
  };

  const handleCheckboxChange = (checked) => {
    const currentQuestion = questions[currentIndex];
    setAnswers(prev => ({ ...prev, [currentQuestion._id]: checked ? 1 : 0 }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // Mark current question as visited when moving to next
      const qId = questions[currentIndex]._id;
      setVisitedQuestions(prev => ({ ...prev, [qId]: true }));
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // Mark current question as visited when moving to previous
      const qId = questions[currentIndex]._id;
      setVisitedQuestions(prev => ({ ...prev, [qId]: true }));
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered()) {
      notify('Please answer all questions', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/submit-test`, { answers, test: testKey });
      setResult(response.data);
      await fetchProfile();
      
      // Test-specific success message
      let testName = testKey;
      if (testKey === 'RIASEC') testName = 'Career Interest Assessment';
      else if (testKey === 'Personality') testName = 'Personality Inventory';
      else if (testKey === 'Aptitude') testName = 'Aptitude Test';
      else if (testKey === 'EI') testName = 'Emotional Intelligence';
      
      notify(`${testName} submitted successfully! 🎉`, 'success');
      
      // celebration on success
      try { celebrate(); } catch (e) { /* ignore if unavailable */ }
    } catch (error) {
      notify('Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isAnswered = (q) => {
    const a = answers[q._id];
    const t = (q.test || '').toString().toLowerCase();
    // Slider-based tests: RIASEC (5-point), Personality (5-point), EI (7-point)
    // All require explicit user selection, so undefined means not answered
    if (t === 'riasec') return a !== undefined;
    if (t === 'personality') return a !== undefined;
    if (t === 'ei') return a !== undefined;
    // Aptitude uses MCQ radio buttons - undefined or empty/null/0 means not answered
    if (t === 'aptitude') return a !== undefined && a !== '' && a !== 0 && a !== null;
    // Generic fallback for checkbox-based tests
    return a !== undefined && a !== 0;
  };

  const allAnswered = () => {
    if (!questions || !questions.length) return false;
    return questions.every(q => isAnswered(q));
  };

  const jumpTo = (idx) => {
    const qId = questions[idx]._id;
    setVisitedQuestions(prev => ({ ...prev, [qId]: true }));
    setCurrentIndex(idx);
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

  // Show instructions screen before starting the test
  if (showInstructions && !result) {
    // Test-specific instructions
    const getInstructions = () => {
      switch (testKey) {
        case 'RIASEC':
          return {
            icon: '🎯',
            title: 'Holland Career Code Assessment',
            subtitle: 'What Sparks your Interest?',
            fullText: `This assessment is designed to help you understand your interests, strengths, and preferred ways of working.

There are no right or wrong answers—respond honestly based on what you enjoy or feel comfortable doing. Your responses will help identify career paths that align with your natural inclinations and engineering interests. The results are meant for self-reflection and career planning, not for evaluation or grading.

Please answer all questions thoughtfully to gain the most meaningful insights from the assessment.`
          };
        case 'Personality':
          return {
            icon: '😊',
            title: 'Warwick–Edinburgh Mental Wellbeing Scale',
            subtitle: null,
            fullText: `This assessment is designed to understand your general mental wellbeing and positive feelings. It focuses on thoughts, emotions, and experiences related to everyday life.

There are no right or wrong answers—please respond honestly based on how you have been feeling recently.

Please read each statement carefully and choose the option that best reflects your experience and your feelings in the past 2 weeks.`
          };
        case 'EI':
          return {
            icon: '💭',
            title: 'Trait Emotional Intelligence Questionnaire (TEIQue)',
            subtitle: null,
            fullText: `This questionnaire is designed to understand how you typically perceive, express, and manage your emotions.

There are no right or wrong answers—please respond based on what best reflects you, not what you think is expected.

Your responses will help in gaining insights into emotional strengths and areas for personal development.`
          };
        case 'Aptitude':
          return {
            icon: '🛡️',
            title: 'Student Resilience Survey (SRS)',
            subtitle: null,
            fullText: `This survey is designed to understand how you respond to challenges, stress, and change in your academic and personal life.

There are no right or wrong answers—please respond honestly based on your usual experiences.

Your responses will help identify strengths and areas where additional support may be helpful.`
          };
        default:
          return {
            icon: '📋',
            title: 'Assessment',
            subtitle: null,
            fullText: 'Please answer all questions honestly and thoughtfully.'
          };
      }
    };

    const inst = getInstructions();

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-8 md:p-10">
          {/* Header Section */}
          <div className="text-center mb-8 pb-6 border-b-2 border-indigo-200">
            <div className="text-6xl mb-4 animate-bounce">{inst.icon}</div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {inst.title}
            </h2>
            {inst.subtitle && (
              <p className="text-xl text-indigo-700 font-semibold italic mt-2">{inst.subtitle}</p>
            )}
          </div>

          {/* Main Content */}
          <div className="mb-8">
            <div className="bg-white border-l-4 border-indigo-600 rounded-lg p-6 mb-6 shadow-sm">
              <p className="text-base leading-relaxed whitespace-pre-line text-gray-800 font-medium">
                {inst.fullText}
              </p>
            </div>

            {/* Key Points Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">✓</div>
                <p className="text-sm font-semibold text-green-800">Honest Responses</p>
                <p className="text-xs text-green-700 mt-1">Be truthful and authentic</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">⏱️</div>
                <p className="text-sm font-semibold text-blue-800">Take Your Time</p>
                <p className="text-xs text-blue-700 mt-1">No time pressure</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-sm font-semibold text-purple-800">Self-Discovery</p>
                <p className="text-xs text-purple-700 mt-1">Meaningful insights</p>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-900 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span><strong>Important:</strong> There are no right or wrong answers. Your honest responses will provide the most accurate and meaningful results.</span>
              </p>
            </div>
          </div>

          {/* Ready Checkbox */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-5 mb-6 border border-indigo-300">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={readyToStart}
                onChange={(e) => setReadyToStart(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="ml-3 text-gray-800 font-medium">
                I have read and understood the instructions above
              </span>
            </label>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={() => setShowInstructions(false)}
              disabled={!readyToStart}
              className={`px-10 py-3 rounded-xl font-bold text-lg transition-all shadow-lg ${
                readyToStart
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 cursor-pointer transform hover:scale-105 active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {readyToStart ? '✨ Start Test' : 'Check the box to continue'}
            </button>
            <p className="text-xs text-gray-600 mt-3">You can always go back to review these instructions later</p>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    if (testKey === 'EI') {
      const factors = result.factors || {};
      const factorFeedback = result.factorFeedback || {};
      const globalScore = result.globalScore || 0;
      const globalLevel = result.globalLevel || 'Average';
      const globalFeedback = result.globalFeedback || '';

      return (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-green-500 text-white rounded-xl p-8 text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-3xl font-bold">Emotional Intelligence Assessment Complete</h2>
            <div className="text-lg mt-4 font-semibold">Global EI Score: <span className="text-2xl">{globalScore.toFixed(2)}</span> / 7.0</div>
            <div className="text-sm mt-2 opacity-90 font-semibold">Level: {globalLevel}</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4 text-center">Your EI Factor Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(factors).map(([factor, score]) => {
                const fb = factorFeedback[factor] || {};
                const scoreLevelColor = fb.level === 'High' ? 'text-green-600' : fb.level === 'Low' ? 'text-red-600' : 'text-yellow-600';
                const bgColor = fb.level === 'High' ? 'bg-green-50' : fb.level === 'Low' ? 'bg-red-50' : 'bg-yellow-50';
                const borderColor = fb.level === 'High' ? 'border-green-200' : fb.level === 'Low' ? 'border-red-200' : 'border-yellow-200';
                return (
                  <div key={factor} className={`${bgColor} border-2 ${borderColor} rounded-lg p-4`}>
                    <h4 className="text-lg font-bold mb-2">{factor}</h4>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className={`text-3xl font-bold ${scoreLevelColor}`}>{score.toFixed(2)}</span>
                      <span className={`text-sm font-semibold ${scoreLevelColor}`}>{fb.level}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{fb.feedback}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
            <h4 className="font-bold text-indigo-800 text-lg mb-2">Overall Emotional Intelligence Profile</h4>
            <p className="text-sm text-indigo-700 leading-relaxed">{globalFeedback}</p>
          </div>
        </div>
      );
    }

    if (testKey === 'Personality') {
      const score = result.score || 0;
      const questionCount = result.questionCount || questions.length;
      const interpretation = result.interpretation || '';
      const feedback = result.feedback || '';
      
      // Determine score range text
      let scoreRange = '';
      if (questionCount >= 14) {
        scoreRange = `WEMWBS (14-item): ${score}/70`;
      } else {
        scoreRange = `SWEMWBS (7-item): ${score}/35`;
      }

      return (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-green-500 text-white rounded-xl p-8 text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-3xl font-bold">Personality Assessment Complete</h2>
            <div className="text-sm mt-2 opacity-90">{scoreRange}</div>
            <div className="text-lg mt-2 font-semibold">{interpretation}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Feedback & Recommendations</h3>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{feedback}</div>
          </div>
        </div>
      );
    }

    if (testKey === 'Aptitude') {
      const score = result.score || result.correct || 0;
      const total = result.total || result.totalQuestions || questions.length || 0;
      return (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-green-500 text-white rounded-xl p-8 text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-3xl font-bold">Aptitude Test Complete</h2>
            <div className="text-sm mt-1 opacity-90">Score: {score} / {total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Summary</h3>
            <div className="text-sm text-gray-700">You answered {score} out of {total} correctly.</div>
          </div>
        </div>
      );
    }

    // Fallback / RIASEC-style display
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
            {(result.topThree || []).map((area, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold">#{idx + 1}: {area}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-800 mb-2">Preferred Tasks & Activities</h4>
            <div className="grid grid-cols-1 gap-2">
              {(result.recommendedCareers || []).map((task, idx) => (
                <div key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const testTitle = testKey || 'Assessment';
  const hasAnswer = answers[currentQuestion._id] !== undefined;
  const isQuestionVisited = visitedQuestions[currentQuestion._id] === true;
  const showUnansweredWarning = isQuestionVisited && !hasAnswer;
  const currentAnswer = (testKey === 'RIASEC' || testKey === 'Personality')
    ? (hasAnswer ? answers[currentQuestion._id] : 3)
    : (testKey === 'EI')
    ? (hasAnswer ? answers[currentQuestion._id] : 4)
    : (hasAnswer ? answers[currentQuestion._id] : 0);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const sliderLabelsRIASEC = [
    { value: 1, label: 'Strongly Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Agree' },
    { value: 5, label: 'Strongly Agree' }
  ];

  const sliderLabelsEI = [
    { value: 1, label: 'Completely Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Somewhat Disagree' },
    { value: 4, label: 'Neutral' },
    { value: 5, label: 'Somewhat Agree' },
    { value: 6, label: 'Agree' },
    { value: 7, label: 'Completely Agree' }
  ];

  // Personality Inventory scale as requested: None → Rarely → Some → Often → All of the time
  const sliderLabelsPersonality = [
    { value: 1, label: 'None of the time' },
    { value: 2, label: 'Rarely' },
    { value: 3, label: 'Some of the time' },
    { value: 4, label: 'Often' },
    { value: 5, label: 'All of the time' }
  ];

  return (
    <div className="max-w-5xl mx-auto md:flex md:items-start md:gap-6">
      <div className="flex-1">
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

      <div className={`bg-white rounded-xl shadow-md p-8 ${showUnansweredWarning ? 'border-4 border-red-400 bg-red-50' : ''}`}>
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-6">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${showUnansweredWarning ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}>
              {currentQuestion.questionNumber}
            </div>
            <div className="flex-1">
              <p className="text-lg font-medium text-gray-800 pt-1">{currentQuestion.text}</p>
              {showUnansweredWarning && <p className="text-sm text-red-600 mt-2 font-semibold">⚠️ Please answer this question</p>}
            </div>
          </div>
        </div>

        <div className="mb-8">
          {testKey === 'RIASEC' ? (
            <div className="relative px-2">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={currentAnswer}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                onClick={handleRangeClick}
                className={`w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${!hasAnswer ? 'range-no-thumb' : ''}`}
              />
              <div className="flex justify-between mt-3">
                {sliderLabelsRIASEC.map((item) => (
                  <div key={item.value} className="text-center flex-1">
                    <div className={`text-xs font-medium ${(hasAnswer && currentAnswer === item.value) ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : testKey === 'Personality' ? (
            <div className="relative px-2">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={currentAnswer}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                onClick={handleRangeClick}
                className={`w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${!hasAnswer ? 'range-no-thumb' : ''}`}
              />
              <div className="flex justify-between mt-3">
                {sliderLabelsPersonality.map((item) => (
                  <div key={item.value} className="text-center flex-1">
                    <div className={`text-xs font-medium ${(hasAnswer && currentAnswer === item.value) ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : testKey === 'EI' ? (
            <div className="relative px-2">
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={currentAnswer}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                onClick={handleRangeClick}
                className={`w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${!hasAnswer ? 'range-no-thumb' : ''}`}
              />
              <div className="flex justify-between mt-3">
                {sliderLabelsEI.map((item) => (
                  <div key={item.value} className="text-center flex-1">
                    <div className={`text-xs font-medium ${(hasAnswer && currentAnswer === item.value) ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : testKey === 'Aptitude' ? (
            <div className="space-y-3">
              {(currentQuestion.options && currentQuestion.options.length) ? (
                currentQuestion.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-3">
                    <input type="radio" name={`opt_${currentQuestion._id}`} checked={answers[currentQuestion._id] === opt} onChange={() => setAnswers(prev => ({ ...prev, [currentQuestion._id]: opt }))} />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))
              ) : (
                <div className="text-sm text-gray-500">No options configured for this aptitude question.</div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={!!currentAnswer} onChange={(e) => handleCheckboxChange(e.target.checked)} className="h-4 w-4" />
                <span className="text-sm">Mark as applicable / true</span>
              </label>
            </div>
          )}
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
              disabled={!allAnswered() || submitting}
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
      {/* Sidebar: question status */}
      <div className="w-40 hidden md:block">
        <div className="bg-white rounded-xl shadow-md p-4 sticky top-24">
          <h4 className="text-sm font-semibold mb-3">Questions</h4>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, idx) => {
              const answered = isAnswered(q);
              const visited = visitedQuestions[q._id];
              const status = answered ? 'answered' : (visited ? 'visited-unanswered' : 'unvisited');
              const bg = status === 'answered' ? 'bg-green-500 text-white' : (status === 'visited-unanswered' ? 'bg-red-400 text-white' : 'bg-white text-gray-700 border');
              return (
                <button key={q._id} onClick={() => jumpTo(idx)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${bg}` } title={`Q ${q.questionNumber}`}>
                  {q.questionNumber}
                </button>
              );
            })}
          </div>
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
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ rollNumber: '', name: '', year: '', password: '' });
  const [studentFile, setStudentFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [tests, setTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riasecFilter, setRiasecFilter] = useState('ALL');
  const { notify, confirm } = useNotification();

  useEffect(() => {
    fetchStudents();
    fetchTests();
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

  const fetchTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/tests`);
      setTests(res.data || []);
    } catch (err) {
      // fallback to known tests if needed
      setTests([{ key: 'RIASEC', name: 'RIASEC' }]);
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

  const handleResetAssessmentForTest = async (id, name, testKey) => {
    const ok = await confirm(`Reset assessment for ${name} (${testKey})?`);
    if (!ok) return;
    try {
      await axios.post(`${API_URL}/admin/students/${id}/reset-assessment`, { test: testKey });
      fetchStudents();
      notify(`Assessment for ${testKey} reset successfully`, 'success');
    } catch (error) {
      notify('Failed to reset assessment', 'error');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = { rollNumber: newStudent.rollNumber, name: newStudent.name, password: newStudent.password || 'student', year: newStudent.year };
      const res = await axios.post(`${API_URL}/admin/students`, payload);
      setStudents(prev => [res.data, ...prev]);
      setNewStudent({ rollNumber: '', name: '', year: '', password: '' });
      setShowAddStudent(false);
      notify('Student added', 'success');
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to add student', 'error');
    }
  };

  const handleStudentFileChange = (e) => {
    setStudentFile(e.target.files[0]);
  };

  const handleUploadStudents = async () => {
    if (!studentFile) return notify('Select a file first', 'error');
    const fd = new FormData();
    fd.append('file', studentFile);
    try {
      await axios.post(`${API_URL}/admin/students/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notify('Upload complete', 'success');
      fetchStudents();
    } catch (err) {
      notify(err.response?.data?.error || 'Upload failed', 'error');
    }
  };
  const downloadResult = (student, result) => {
    let reportLines = [];
    reportLines.push(`CAREER ASSESSMENT REPORT`);
    reportLines.push(``);
    reportLines.push(`Student Information:`);
    reportLines.push(`- Name: ${student.name}`);
    reportLines.push(`- Roll Number: ${student.rollNumber}`);
    reportLines.push(`- Assessment Date: ${result?.completedAt ? new Date(result.completedAt).toLocaleString() : 'N/A'}`);
    reportLines.push(`- Test Type: ${result?.test || 'N/A'}`);
    reportLines.push(``);

    if (result?.test === 'RIASEC') {
      reportLines.push(`Result (RIASEC Career Assessment):`);
      reportLines.push(`- Primary Career Type: ${result?.primaryCareer || 'N/A'}`);
      reportLines.push(`- Top Three Types: ${result?.topThree?.join(', ') || 'N/A'}`);
      reportLines.push(``);
      reportLines.push(`Score Breakdown:`);
      Object.entries(result?.scores || {}).forEach(([code, score]) => {
        reportLines.push(`- ${code}: ${score} / 35`);
      });
      if (result?.recommendedCareers && result.recommendedCareers.length > 0) {
        reportLines.push(``);
        reportLines.push(`Recommended Careers:`);
        result.recommendedCareers.forEach(c => reportLines.push(`- ${c}`));
      }
    } else if (result?.test === 'EI') {
      reportLines.push(`Result (Emotional Intelligence - TEIQue-SF):`);
      const globalScore = result?.globalScore;
      const globalLevel = result?.globalLevel;
      
      if (globalScore !== undefined && globalScore !== null) {
        const scoreNum = typeof globalScore === 'number' ? globalScore : parseFloat(globalScore);
        reportLines.push(`- Global EI Score: ${scoreNum.toFixed(2)} / 7.0`);
      } else {
        reportLines.push(`- Global EI Score: Data not available`);
      }
      
      if (globalLevel) {
        reportLines.push(`- Level: ${globalLevel}`);
      }
      
      reportLines.push(``);
      reportLines.push(`Factor Scores:`);
      
      const factorData = result?.factorFeedback || result?.factors || {};
      if (Object.keys(factorData).length > 0) {
        Object.entries(factorData).forEach(([factor, data]) => {
          const scoreValue = typeof data === 'object' && data.score ? data.score : data;
          const numScore = typeof scoreValue === 'number' ? scoreValue : parseFloat(scoreValue);
          if (!isNaN(numScore)) {
            reportLines.push(`- ${factor}: ${numScore.toFixed(2)} / 7.0`);
          } else {
            reportLines.push(`- ${factor}: Data not available`);
          }
        });
      } else {
        reportLines.push(`- Factor data not available`);
      }
      
      if (result?.globalFeedback) {
        reportLines.push(``);
        reportLines.push(`Overall Assessment:`);
        reportLines.push(result.globalFeedback);
      }
    } else if (result?.test === 'Personality') {
      reportLines.push(`Result (Personality Inventory):`);
      const score = result?.score ?? result?.total ?? result?.correct ?? 'N/A';
      const qCount = result?.questionCount || 0;
      const range = qCount >= 14 ? 70 : 35;
      reportLines.push(`- Score: ${score} / ${range}`);
      reportLines.push(`- Scale: ${qCount >= 14 ? 'WEMWBS (14-item)' : 'SWEMWBS (7-item)'}`);
      if (result?.interpretation) reportLines.push(`- Interpretation: ${result.interpretation}`);
      if (result?.feedback) {
        reportLines.push(``);
        reportLines.push(`Feedback:`);
        reportLines.push(result.feedback);
      }
    } else if (result?.test === 'Aptitude') {
      reportLines.push(`Result (Aptitude Test):`);
      const score = result?.score ?? result?.correct ?? 0;
      const total = result?.total ?? result?.totalQuestions ?? 'N/A';
      reportLines.push(`- Score: ${score} / ${total}`);
      reportLines.push(`- Correct Answers: ${score}`);
    } else {
      reportLines.push(`Result: ${result?.test || 'Unknown'} test - Data available`);
    }

    const report = reportLines.join('\n');
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.rollNumber}_${result?.test || 'result'}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div></div>;

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = student.rollNumber.toLowerCase().includes(query) || student.name.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (riasecFilter === 'ALL') return true;

    // find latest RIASEC result
    const latestRIASEC = (student.testResults || []).slice().reverse().find(tr => tr.test === 'RIASEC');
    if (!latestRIASEC) return riasecFilter === 'NONE';
    let primaryCode = null;
    if (latestRIASEC.topThree && latestRIASEC.topThree.length) {
      primaryCode = latestRIASEC.topThree[0].split(' ')[0];
    } else if (latestRIASEC.scores) {
      const entry = Object.entries(latestRIASEC.scores).sort(([,a],[,b]) => b - a)[0];
      primaryCode = entry ? entry[0] : null;
    }
    if (!primaryCode) return false;
    return primaryCode.toUpperCase() === riasecFilter;
  });

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Student Management</h2>
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
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
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-xs font-semibold text-purple-700">TOTAL RESULTS</p>
            <p className="text-3xl font-bold text-purple-600">{students.reduce((sum, s) => sum + (s.testResults?.length || 0), 0)}</p>
          </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex gap-2 items-center">
              <input type="file" accept=".xlsx,.csv" onChange={handleStudentFileChange} className="text-sm" />
              <button onClick={handleUploadStudents} className="px-4 py-2 bg-green-500 text-white rounded-lg">Upload Students</button>
            </div>
            <button onClick={() => setShowAddStudent(s => !s)} className={`px-5 py-2 rounded-lg font-semibold ${showAddStudent ? 'bg-gray-600 text-white' : 'bg-indigo-600 text-white'}`}>{showAddStudent ? 'Cancel' : '+ Add Student'}</button>
          </div>
        </div>

        {showAddStudent && (
          <form onSubmit={handleAddStudent} className="bg-indigo-50 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <input required value={newStudent.rollNumber} onChange={(e) => setNewStudent({...newStudent, rollNumber: e.target.value})} placeholder="Roll Number" className="px-3 py-2 border rounded" />
            <input required value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="Name" className="px-3 py-2 border rounded" />
            <input value={newStudent.year} onChange={(e) => setNewStudent({...newStudent, year: e.target.value})} placeholder="Year (optional)" className="px-3 py-2 border rounded" />
            <input value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} placeholder="Password (default: student)" className="px-3 py-2 border rounded" />
            <div className="col-span-4 text-right">
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Add Student</button>
            </div>
          </form>
        )}

        <div className="mb-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Roll Number or Name..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-3">
            <select
              value={riasecFilter}
              onChange={(e) => setRiasecFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="ALL">All RIASEC</option>
              <option value="NONE">No RIASEC result</option>
              <option value="R">Realistic (R)</option>
              <option value="I">Investigative (I)</option>
              <option value="A">Artistic (A)</option>
              <option value="S">Social (S)</option>
              <option value="E">Enterprising (E)</option>
              <option value="C">Conventional (C)</option>
            </select>
            <button 
              onClick={async () => {
                try {
                  const response = await axios.get(`${API_URL}/admin/download-all-results`, {
                    responseType: 'blob'
                  });
                  const url = URL.createObjectURL(response.data);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'All_Students_Results.xlsx';
                  a.click();
                  URL.revokeObjectURL(url);
                  notify('Results downloaded successfully!', 'success');
                } catch (error) {
                  notify('Failed to download results', 'error');
                  console.error(error);
                }
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold whitespace-nowrap"
              title="Download all students' results as Excel"
            >
              📥 Download All Results
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
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
            {filteredStudents.map(student => {
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
                      <div className="space-y-2 text-xs">
                        {latestResult.test === 'RIASEC' ? (
                          <>
                            <div className="grid grid-cols-3 gap-2">
                              {['R','I','A','S','E','C'].map(code => {
                                const score = latestResult.scores?.[code] || 0;
                                const maxScore = 35;
                                const pct = Math.round((score / maxScore) * 100);
                                return (
                                  <div key={code} className="flex items-center gap-1">
                                    <div className="w-6 text-sm font-semibold text-indigo-700">{code}</div>
                                    <div className="flex-1">
                                      <div className="text-xs text-gray-500">{score}/{maxScore}</div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-0.5">
                                        <div className={`bg-indigo-500 h-1.5 rounded-full`} style={{ width: `${pct}%` }}></div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="text-gray-500">Top: {latestResult.topThree?.map(t => t.split(' ')[0]).join(', ')}</div>
                          </>
                        ) : latestResult.test === 'Personality' ? (
                          <>
                            <div className="font-semibold text-indigo-600">
                              Score: {latestResult.score || latestResult.total || '—'} / {latestResult.questionCount >= 14 ? 70 : 35}
                            </div>
                            <div className="text-gray-600">{latestResult.interpretation || 'Assessment completed'}</div>
                          </>
                        ) : latestResult.test === 'Aptitude' ? (
                          <>
                            <div className="font-semibold text-indigo-600">
                              Score: {latestResult.score || latestResult.correct || 0} / {latestResult.total || latestResult.totalQuestions || '—'}
                            </div>
                          </>
                        ) : latestResult.test === 'EI' ? (
                          <>
                            <div className="font-semibold text-teal-600">
                              Global EI: {latestResult.globalScore !== undefined && latestResult.globalScore !== null ? (typeof latestResult.globalScore === 'number' ? latestResult.globalScore.toFixed(2) : latestResult.globalScore) : '—'} / 7.0
                            </div>
                            <div className="text-gray-600">Level: {latestResult.globalLevel || '—'}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {(() => {
                                const factorData = latestResult.factorFeedback || latestResult.factors || {};
                                const factorCount = Object.keys(factorData).length;
                                return factorCount > 0 ? `${factorCount} factors assessed` : 'Factors available';
                              })()}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500">{latestResult.test} - Test completed</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Not available</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {latestResult && (
                        <button
                          onClick={() => downloadResult(student, latestResult)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold"
                          title="Download Report"
                        >
                          Download
                        </button>
                      )}
                      <div className="flex items-center gap-2">
                        {tests.map(t => {
                          const has = (student.testResults || []).some(tr => tr.test === t.key);
                          return (
                            <button
                              key={t.key}
                              onClick={() => handleResetAssessmentForTest(student._id, student.name, t.key)}
                              disabled={!has}
                              className={`px-3 py-1 rounded text-xs font-semibold ${has ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                              title={has ? `Reset ${t.name}` : `No ${t.name} result to reset`}
                            >
                              Reset {t.key}
                            </button>
                          );
                        })}
                      </div>
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
      </div>
      {/* Viewing modal for a selected student (inside StudentsManagement scope) */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Results for {viewingStudent.name}</h3>
              <button onClick={() => setViewingStudent(null)} className="text-gray-500 px-2 py-1">Close</button>
            </div>
            {viewingStudent.testResults && viewingStudent.testResults.length ? (
              <div className="space-y-3 max-h-72 overflow-auto">
                {viewingStudent.testResults.map((r, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-1">{r.test}</div>
                        <div className="text-sm text-gray-500 mb-3">Completed: {new Date(r.completedAt).toLocaleString()}</div>
                        
                        {r.test === 'RIASEC' ? (
                          <>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {['R','I','A','S','E','C'].map(code => {
                                const score = r.scores?.[code] || 0;
                                const maxScore = 35;
                                const pct = Math.round((score / maxScore) * 100);
                                return (
                                  <div key={code} className="p-2 bg-white rounded border">
                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                      <div className="font-semibold">{code}</div>
                                      <div>{score}/{maxScore}</div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div className={`bg-indigo-500 h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="text-sm text-gray-600">Top Matches: {r.topThree?.map(t => t.split(' - ')[0]).join(', ')}</div>
                          </>
                        ) : r.test === 'Personality' ? (
                          <>
                            <div className="bg-white rounded border p-3 mb-2">
                              <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Score:</span> {r.score || r.total || '—'} / {r.questionCount >= 14 ? 70 : 35}</div>
                              <div className="text-sm text-gray-700"><span className="font-semibold">Scale:</span> {r.questionCount >= 14 ? 'WEMWBS (14-item)' : 'SWEMWBS (7-item)'}</div>
                              <div className="text-sm text-indigo-600 mt-2 font-semibold">{r.interpretation}</div>
                              {r.feedback && <div className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">{r.feedback}</div>}
                            </div>
                          </>
                        ) : r.test === 'Aptitude' ? (
                          <>
                            <div className="bg-white rounded border p-3">
                              <div className="text-sm text-gray-700"><span className="font-semibold">Score:</span> {r.score || r.correct || 0} / {r.total || r.totalQuestions || '—'}</div>
                              <div className="text-sm text-gray-600 mt-2">Correct Answers: {r.score || r.correct || 0}</div>
                            </div>
                          </>
                        ) : r.test === 'EI' ? (
                          <>
                            <div className="bg-white rounded border p-3 mb-2">
                              <div className="mb-3 pb-3 border-b">
                                <div className="text-sm text-gray-700">
                                  <span className="font-semibold">Global EI Score:</span> <span className="text-lg font-bold text-teal-600">{r.globalScore !== undefined && r.globalScore !== null ? (typeof r.globalScore === 'number' ? r.globalScore.toFixed(2) : r.globalScore) : '—'}</span> / 7.0
                                </div>
                                <div className="text-sm text-gray-700 mt-1">
                                  <span className="font-semibold">Level:</span> <span className="font-semibold text-indigo-600">{r.globalLevel || '—'}</span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="text-xs font-semibold text-gray-600 mb-2">FACTOR BREAKDOWN</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {(() => {
                                    const factorData = r.factorFeedback || r.factors || {};
                                    return Object.entries(factorData).map(([factor, data]) => {
                                      const scoreValue = typeof data === 'object' && data.score ? data.score : data;
                                      const levelValue = typeof data === 'object' && data.level ? data.level : '';
                                      const displayScore = typeof scoreValue === 'number' ? scoreValue.toFixed(2) : (isNaN(parseFloat(scoreValue)) ? '—' : parseFloat(scoreValue).toFixed(2));
                                      const levelColor = levelValue === 'High' ? 'text-green-600' : levelValue === 'Low' ? 'text-red-600' : 'text-yellow-600';
                                      const bgColor = levelValue === 'High' ? 'bg-green-50' : levelValue === 'Low' ? 'bg-red-50' : 'bg-yellow-50';
                                      return (
                                        <div key={factor} className={`${bgColor} p-2 rounded text-xs border`}>
                                          <div className="font-semibold text-gray-700">{factor}</div>
                                          <div className={`font-bold ${levelColor}`}>{displayScore}/7.0</div>
                                          {levelValue && <div className="text-gray-600">{levelValue}</div>}
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : null}

                      </div>
                      <div className="flex-shrink-0">
                        <button onClick={() => downloadResultForUser(r, viewingStudent)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold whitespace-nowrap">Download</button>
                      </div>
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
  const [formData, setFormData] = useState({ questionNumber: '', text: '', category: 'R', test: 'RIASEC', options: '', correctAnswer: '' });
  const [questionFile, setQuestionFile] = useState(null);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('RIASEC');
  const { notify, confirm } = useNotification();

  const fetchQuestions = React.useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/questions`, { params: { test: selectedTest } });
      setQuestions(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }, [selectedTest]);

  const fetchTests = React.useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/tests`);
      setTests(res.data || []);
      if (res.data && res.data.length && !selectedTest) {
        setSelectedTest(res.data[0].key);
      }
    } catch (err) {
      console.error('Failed to fetch tests for admin', err);
    }
  }, [selectedTest]);

  useEffect(() => {
    fetchTests();
    fetchQuestions();
  }, [fetchTests, fetchQuestions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure `test` is always present in the payload (fallback to selectedTest)
      const payload = { ...formData, test: formData.test || selectedTest };
      // If aptitude, normalize options into array and include correctAnswer
      if ((payload.test === 'Aptitude' || payload.test === 'aptitude') && payload.options) {
        // split on comma or semicolon and trim
        payload.options = payload.options.split(/[,;]\s*/).map(s => s.trim()).filter(Boolean);
      }
      if (editing) {
        await axios.put(`${API_URL}/questions/${editing._id}`, payload);
        notify('Updated successfully', 'success');
      } else {
        await axios.post(`${API_URL}/questions`, payload);
        notify('Added successfully', 'success');
      }
      // Reset form but keep the test pre-selected to the current domain
      setFormData({ questionNumber: '', text: '', category: 'R', test: selectedTest });
      setShowForm(false);
      setEditing(null);
      fetchQuestions();
    } catch (error) {
      notify('Failed to save', 'error');
    }
  };

  const handleEdit = (q) => {
    setFormData({ questionNumber: q.questionNumber, text: q.text, category: q.category, test: q.test || 'RIASEC', options: (q.options || []).join(', '), correctAnswer: q.correctAnswer || '' });
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
                  <button
                    key={t.key}
                    onClick={() => {
                      // set selected test and fetch questions for that test immediately (avoid stale selectedTest)
                      setSelectedTest(t.key);
                      setLoading(true);
                      setShowForm(false);
                      setEditing(null);
                      setFormData({ questionNumber: '', text: '', category: 'R', test: t.key });
                      // fetch questions for the explicit test key to avoid race with setSelectedTest
                      (async (testKey) => {
                        try {
                          const resp = await axios.get(`${API_URL}/questions`, { params: { test: testKey } });
                          setQuestions(resp.data);
                        } catch (err) {
                          console.error('Failed to fetch questions for test', testKey, err);
                        } finally {
                          setLoading(false);
                        }
                      })(t.key);
                    }}
                    className={`px-4 py-2 rounded-lg ${selectedTest === t.key ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <input type="file" accept=".xlsx,.csv" onChange={(e) => setQuestionFile(e.target.files[0])} className="hidden md:block" />
              <button onClick={() => {
                // trigger file selection on small screens
                if (!questionFile) return document.querySelector('input[type=file]').click();
              }} className="hidden md:block px-3 py-2 rounded bg-gray-100 text-sm">Select file</button>

              <button onClick={async () => {
                if (!questionFile) return notify('Select a file first', 'error');
                const fd = new FormData();
                fd.append('file', questionFile);
                // pass selected test so rows missing test can be defaulted
                fd.append('test', selectedTest || formData.test || 'RIASEC');
                try {
                  await axios.post(`${API_URL}/admin/questions/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                  notify('Questions uploaded successfully', 'success');
                  fetchQuestions();
                } catch (err) {
                  notify(err.response?.data?.error || 'Upload failed', 'error');
                }
              }} className={`px-5 py-2 rounded-lg font-semibold ${showForm ? 'bg-gray-600 text-white' : 'bg-green-500 text-white'}`}>
                Upload Questions
              </button>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {/* Options + correct answer for Aptitude type */}
            {(formData.test === 'Aptitude' || formData.test === 'aptitude') && (
              <div>
                <label className="block font-semibold mb-1 text-sm">Options (comma or semicolon separated)</label>
                <input value={formData.options} onChange={(e) => setFormData({...formData, options: e.target.value})} placeholder="Option1, Option2, Option3" className="w-full px-3 py-2 border rounded-lg outline-none" />
                <label className="block font-semibold mt-3 mb-1 text-sm">Correct Answer (exact option text)</label>
                <input value={formData.correctAnswer} onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})} placeholder="Correct option text" className="w-full px-3 py-2 border rounded-lg outline-none" />
              </div>
            )}
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