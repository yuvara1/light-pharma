import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import createLogger from "../utils/logger.js";
import { FiMail, FiLock, FiLogIn, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import logo from '../../assets/light-pharma.png'

const logger = createLogger('LOGIN');

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, sessionStatus } = useAuth();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      setSessionMessage("Session restored successfully!");
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
    }
  }, [sessionStatus, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const email = emailRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";
    
    try {
      logger.debug('Login attempt', { email, rememberMe });
      
      if (!email || !password) {
        setError("Email and password are required");
        setLoading(false);
        return;
      }

      if (!email.includes("@")) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      
      const result = await login(email, password);
      logger.info('Login successful', { email, userId: result.user?.id });
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      setSessionMessage("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
      
    } catch (err) {
      logger.error('Login failed', { email, error: err.error || err.message });
      setError(err?.error || err?.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && emailRef.current) {
      emailRef.current.value = rememberedEmail;
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm">
        {/* Logo and Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30">
              <img
                alt="light pharma"
                src={logo}
                className="h-12 sm:h-14 w-auto"
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Sign in to your account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl">
          
          {/* Messages */}
          {sessionMessage && (
            <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 sm:p-4 flex items-center gap-3">
              <FiCheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-emerald-300">{sessionMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 sm:p-4 flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                <input
                  ref={emailRef}
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                <input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-400"
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-slate-800/50 border border-slate-700 rounded accent-indigo-600 cursor-pointer"
                disabled={loading}
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-400 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <FiLogIn className="w-4 h-4" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 sm:my-6 border-t border-slate-700"></div>

          {/* Sign Up Link */}
          <button
            type="button"
            onClick={() => navigate("/register")}
            disabled={loading}
            className="w-full py-2.5 sm:py-3 border border-slate-700 hover:bg-slate-800/30 rounded-lg text-white font-semibold text-sm transition disabled:opacity-50"
          >
            Create new account
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6 px-2">
          By signing in, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default Login;
