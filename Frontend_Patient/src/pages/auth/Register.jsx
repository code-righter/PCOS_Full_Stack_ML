import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const Register = () => {
  const navigate = useNavigate();
  
  // UI State: 'signup' | 'verification' | 'success'
  const [step, setStep] = useState('signup');
  
  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    age: '',
    password: '',
    userType: 'patient'
  });
  const [otp, setOtp] = useState('');
  
  // Status States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Timer State (120 seconds = 2 mins)
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);

  // -- Handlers --

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Submit Details & Request OTP
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.registerInit(formData);
      // If successful, switch to OTP view
      setStep('verification');
      setTimer(120); // Start countdown
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Email might already exist.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP & Finalize
  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Combine original data with the OTP
      const finalPayload = { ...formData, otp };
      await authService.verifyEmail(finalPayload);
      
      setStep('success');
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err) {
      setError("Invalid OTP or Verification Failed.");
    } finally {
      setLoading(false);
    }
  };

  // Resend Logic
  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await authService.registerInit(formData); // Call API again
      setTimer(120);
      setCanResend(false);
      alert("Code resent successfully!");
    } catch (err) {
      setError("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // Timer Effect
  useEffect(() => {
    let interval;
    if (step === 'verification' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Helper to format MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-sky-50 to-blue-100 flex items-center justify-center p-4 relative">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">

        {/* --- LEFT SIDE: Branding (Same as Login) --- */}
        <div className="hidden md:flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-blue-100 shadow-xl p-6">
             {/* ... (Keeping your original branding visuals) ... */}
            <div className="inline-flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-blue-700">Join Patient Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              Create your Account
            </h1>
            <p className="text-sm text-slate-600">
              Sign up to book appointments, track your health history, and access lab reports instantly.
            </p>
             <div className="mt-5 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <span className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-indigo-500 border-2 border-white text-xs flex items-center justify-center text-white font-semibold">P</span>
                  <span className="w-8 h-8 rounded-full bg-linear-to-tr from-sky-400 to-blue-500 border-2 border-white text-xs flex items-center justify-center text-white font-semibold">C</span>
                </div>
                <div className="text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">Secure & Confidential</p>
                  <p>Your health data is our top priority.</p>
                </div>
              </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: Dynamic Form Card --- */}
        <div className="w-full">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-blue-100 p-8 md:p-10 relative">

            {/* Error Banner */}
            {error && (
               <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-xs animate-pulse">
                 {error}
               </div>
            )}

            {/* ---------------- STEP 1: SIGN UP FORM ---------------- */}
            {step === 'signup' && (
              <div id="signUpForm" className="animate-in fade-in slide-in-from-right-4 duration-300">
                 {/* Header */}
                 <div className="text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-slate-900">Sign Up</h2>
                    <p className="text-sm text-slate-600 mt-1">Create your patient account</p>
                 </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Full name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/70 focus:border-transparent outline-none transition bg-slate-50/60 focus:bg-white"
                        placeholder="First Name Last Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Phone number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        required
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/70 focus:border-transparent outline-none transition bg-slate-50/60 focus:bg-white"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      required
                      min={1}
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/70 focus:border-transparent outline-none transition bg-slate-50/60 focus:bg-white"
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Email address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/70 focus:border-transparent outline-none transition bg-slate-50/60 focus:bg-white"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/70 focus:border-transparent outline-none transition bg-slate-50/60 focus:bg-white"
                      placeholder="Create a strong password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? 'Processing...' : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Create Account
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-600">
                  <p>
                    Already registered?{' '}
                    <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                      Sign in instead
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* ---------------- STEP 2: VERIFICATION FORM ---------------- */}
            {step === 'verification' && (
              <div id="verificationForm" className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-lg mb-3">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12l-4 4-4-4m8-4l-4 4-4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Verify your email</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Enter the code sent to <b>{formData.email}</b>
                  </p>
                </div>

                <form onSubmit={handleVerification} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">Verification code</label>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 text-xl tracking-[0.5em] text-center rounded-2xl border border-emerald-300 focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent outline-none transition bg-emerald-50/60"
                      placeholder="000000"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition duration-300 disabled:opacity-70"
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </form>

                <div className="mt-4 text-center text-xs">
                  <button
                    onClick={handleResend}
                    disabled={!canResend}
                    className={`font-semibold ${canResend ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400 cursor-not-allowed'}`}
                  >
                    {canResend ? 'Resend code' : `Resend code in ${formatTime(timer)}`}
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 3: SUCCESS MESSAGE ---------------- */}
            {step === 'success' && (
              <div id="successMessage" className="text-center py-6 animate-in zoom-in duration-300">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to from-emerald-500 to-teal-500 text-white shadow-lg mb-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Account verified</h3>
                <p className="text-xs text-slate-600 mb-2">
                  Your email has been verified successfully.
                </p>
                <p className="text-xs text-slate-500">
                  Redirecting you back to login...
                </p>
              </div>
            )}

          </div>

          {/* Small security note */}
          <div className="mt-4 text-center text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Data encrypted and stored securely on the server.
            </span>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Register;