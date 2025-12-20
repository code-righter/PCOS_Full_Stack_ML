import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link for navigation
import { useAuth } from '../../contexts/AuthContext'; // Check this path matches your folder structure

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Enhancement: Loading state

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-sky-50 to-blue-100 flex items-center justify-center p-4 relative">
        
        {/** Doctor's/Patient's Login Link Container */}
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">

          {/**/}
          <div className="hidden md:flex flex-col gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-blue-100 shadow-xl p-6">
              <div className="inline-flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-blue-700">24/7 Patient Access</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                Welcome to your Patient Portal
              </h1>
              <p className="text-sm text-slate-600">
                Manage appointments, view reports, and stay connected with your doctor from a secure, easy-to-use dashboard.
              </p>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <span className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-indigo-500 border-2 border-white text-xs flex items-center justify-center text-white font-semibold">
                    P
                  </span>
                  <span className="w-8 h-8 rounded-full bg-linear-to-tr from-sky-400 to-blue-500 border-2 border-white text-xs flex items-center justify-center text-white font-semibold">
                    C
                  </span>
                  <span className="w-8 h-8 rounded-full bg-linear-to-tr from-emerald-400 to-teal-500 border-2 border-white text-xs flex items-center justify-center text-white font-semibold">
                    D
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">Trusted by thousands of patients</p>
                  <p>Secure, private, and HIPAA-ready backend compatible.</p>
                </div>
              </div>
            </div>
          </div>

          {/**/}
          <div className="w-full">
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-blue-100 p-8 md:p-10">

              {/**/}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg mb-4">
                  <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Patient Portal</h2>
                <p className="text-sm text-slate-600 mt-2">
                  Sign in or create a new patient account to continue.
                </p>
              </div>

              {/**/}
              <div id="signInForm">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Email address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 14v7m-6-3h12" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/70 focus:border-transparent outline-none transition bg-slate-50/60 focus:bg-white"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 10-6 0v2c0 1.657 1.343 3 3 3z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M5 11h14v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8z" />
                        </svg>
                      </span>
                      <input
                        type="password"
                        id="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/70 focus:border-transparent outline-none transition bg-slate-50/60 focus:bg-white"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* Error Message Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-xs animate-pulse">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                       // Simple CSS Spinner for Enhancement
                       <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-600">
                  <p>
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                      Create one
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/**/}
            <div className="mt-4 text-center text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd" />
                </svg>
                Data encrypted and stored securely on the server.
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;