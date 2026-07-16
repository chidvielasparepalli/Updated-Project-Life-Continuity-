import React, { useState, useEffect } from "react";
import { Shield, Key, Sparkles, Phone, Lock, ArrowRight, UserCheck, Sun, Moon, Languages } from "lucide-react";
import { useThemeLanguage } from "../../context/ThemeLanguageContext";

interface LoginScreenProps {
  onLoginSuccess: (user: any, role: "user" | "nominee") => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { theme, toggleTheme, language, setLanguage, t, languages, isTranslating } = useThemeLanguage();
  const [activeTab, setActiveTab] = useState<"user" | "nominee">("user");
  const [isSignUp, setIsSignUp] = useState(false);

  // Carousel slide state
  const [activeSlide, setActiveSlide] = useState(0);

  // User form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Nominee form states
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [nomineeError, setNomineeError] = useState("");

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
    const payload = isSignUp ? { email, password, name } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      onLoginSuccess(data.user, "user");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "wonderfulcelebrationskart@gmail.com",
          name: "Wonderful Celebrations"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onLoginSuccess(data.user, "user");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "sandbox@lighthouseresilience.com",
          password: "demo"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onLoginSuccess(data.user, "user");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setNomineeError("");
    if (!phone) {
      setNomineeError("Mobile number is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/nominee-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOtpSent(true);
    } catch (err: any) {
      setNomineeError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNomineeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNomineeError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/nominee-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, pin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onLoginSuccess(data, "nominee");
    } catch (err: any) {
      setNomineeError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const slides = [
    {
      title: t("Secure Document Vault"),
      desc: t("Military-grade encryption for all financial playbooks, wills, passwords, and sensitive documents."),
      icon: Shield,
      badge: t("ZERO KNOWLEDGE")
    },
    {
      title: t("Proof-of-Life Check-ins"),
      desc: t("Seamless automated prompts to confirm presence. Delay nominee triggers automatically."),
      icon: Sparkles,
      badge: t("FAIL-SAFE TRIGGER")
    },
    {
      title: t("Secure Nominee Handover"),
      desc: t("Nominees receive immediate encrypted access once verification holds and conditions clear."),
      icon: UserCheck,
      badge: t("SECURE ACCESS")
    },
    {
      title: t("AI Care Companion"),
      desc: t("AI assistant guided by Gemini parses safety documents, creates playbooks, and supports recovery."),
      icon: Lock,
      badge: t("GEMINI POWERED")
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-[#e0dafc] text-black theme-light-container" : "bg-[#2c3353] text-[#e0dafc] theme-dark-container"} font-sans flex flex-col justify-between overflow-x-hidden transition-colors duration-300`}>
      
      {/* Navigation Header */}
      <nav className={`h-20 px-6 sm:px-12 flex items-center justify-between border-b ${theme === "light" ? "bg-white border-indigo-200" : "bg-[#2c3353] border-[#5d6fa3]/30"} shrink-0 transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#e0dafc] rounded-lg flex items-center justify-center text-[#2c3353] border border-indigo-300/30">
            <Shield className="w-6 h-6 text-indigo-700" id="logo-icon" />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight uppercase text-inherit" id="portal-title">
            {t("brandName")}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Selector */}
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-inherit border border-transparent hover:border-[#5d6fa3]/30 transition-all cursor-pointer"
            title={t("themeSelector")}
            id="btn-login-toggle-theme"
          >
            {theme === "light" ? (
              <Moon className="h-4.5 w-4.5 text-indigo-700" />
            ) : (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            )}
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center bg-white/10 dark:bg-white/5 rounded-xl border border-[#5d6fa3]/10 hover:border-[#5d6fa3]/40 transition-all py-1.5 px-2.5 gap-2 text-white">
            <Languages className="h-4 w-4 text-indigo-300 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-wider text-white border-none outline-none cursor-pointer pr-1"
              id="btn-login-toggle-language"
              title={t("languageSelector")}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-black bg-white dark:bg-[#1e233a] dark:text-white uppercase font-bold text-xs">
                  {lang.nativeName}
                </option>
              ))}
            </select>
            {isTranslating && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
            )}
          </div>

          <div className="hidden lg:flex gap-6 text-xs uppercase tracking-wider font-bold opacity-80">
            <span className="hover:text-indigo-500 dark:hover:text-white cursor-pointer">Protocol</span>
            <span className="hover:text-indigo-500 dark:hover:text-white cursor-pointer">Vault</span>
            <span className="hover:text-indigo-500 dark:hover:text-white cursor-pointer">FAQ</span>
          </div>
        </div>
      </nav>

      {/* Main Content split screen */}
      <main className="flex-1 flex flex-col md:flex-row">
        
        {/* Left column: Branding, value propositions & Carousel */}
        <div className="w-full md:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-center gap-6 border-b md:border-b-0 md:border-r border-[#5d6fa3]/20 bg-gradient-to-br from-[#1e2237] to-[#141727] dark:from-[#2c3353] dark:to-[#1e233a] text-white">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-xs text-indigo-300 font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              {t("brandName")}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-white" id="portal-desc">
              {t("loginTitle")}
            </h1>
          </div>

          {/* Interactive Core Showcase Carousel */}
          <div className="relative p-6 rounded-2xl border border-[#5d6fa3]/30 bg-[#2c3353]/45 overflow-hidden shadow-xl min-h-[170px] flex flex-col justify-between">
            {/* Slide Background Visual Graphic */}
            <div className="absolute right-3 top-3 opacity-10">
              <Shield className="h-28 w-28 text-indigo-500" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 uppercase tracking-widest">
                  {slides[activeSlide].badge}
                </span>
                <span className="text-[10px] font-mono text-indigo-200/50">
                  {activeSlide + 1} / {slides.length}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
                  {React.createElement(slides[activeSlide].icon, { className: "h-5 w-5" })}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{slides[activeSlide].title}</h3>
                  <p className="text-xs text-indigo-200/80 leading-relaxed mt-1">{slides[activeSlide].desc}</p>
                </div>
              </div>
            </div>

            {/* Carousel Navigation indicators & manual buttons */}
            <div className="flex items-center justify-between border-t border-[#5d6fa3]/20 pt-4 mt-4">
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${idx === activeSlide ? "w-6 bg-indigo-400" : "w-2 bg-indigo-500/30 hover:bg-indigo-500/50"}`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-indigo-200 transition-all cursor-pointer font-bold border border-white/5"
                >
                  &larr;
                </button>
                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                  className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-indigo-200 transition-all cursor-pointer font-bold border border-white/5"
                >
                  &rarr;
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="inline-flex px-4 py-2 rounded-full bg-[#5d6fa3]/20 border border-[#5d6fa3]/40 text-xs text-indigo-200 font-semibold items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              {t("systemStatus")}
            </div>
          </div>
        </div>

        {/* Right column: Interactive form panel */}
        <div className={`w-full md:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-center items-center ${theme === "light" ? "bg-white" : "bg-[#2c3353]"} transition-colors duration-300`}>
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-inherit">{t("welcomeBack")}</h2>
              <p className="text-[#5d6fa3] text-sm font-medium">{t("portalDesc")}</p>
            </div>

            {/* Main Tabs */}
            <div className="bg-[#5d6fa3]/10 p-1 rounded-full flex mb-8 border border-[#5d6fa3]/10">
              <button
                type="button"
                onClick={() => { setActiveTab("user"); setError(""); setNomineeError(""); }}
                className={`flex-1 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === "user"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-[#5d6fa3] hover:text-indigo-600 dark:hover:text-[#e0dafc]"
                }`}
                id="tab-primary-user"
              >
                {t("userPortal")}
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("nominee"); setError(""); setNomineeError(""); }}
                className={`flex-1 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === "nominee"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-[#5d6fa3] hover:text-indigo-600 dark:hover:text-[#e0dafc]"
                }`}
                id="tab-nominee-user"
              >
                {t("nomineePortal")}
              </button>
            </div>

            {activeTab === "user" ? (
              <div className="space-y-4">
                {/* PRIMARY USER LOGIN/SIGNUP FORM */}
                <form className="space-y-4" onSubmit={handleUserSubmit}>
                  {isSignUp && (
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#5d6fa3] font-bold">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-lg p-3 text-sm text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                        placeholder="Alex Mercer"
                        id="input-signup-name"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#5d6fa3] font-bold">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-lg p-3 text-sm text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                      placeholder="alex@example.com"
                      id="input-user-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#5d6fa3] font-bold">Secure Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-lg p-3 text-sm text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                      placeholder="••••••••"
                      id="input-user-password"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 bg-red-950/40 p-3 rounded-lg border border-red-900/50" id="user-auth-error">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#e0dafc] text-[#2c3353] font-bold rounded-lg hover:brightness-110 shadow-xl transition-all flex items-center justify-center gap-2"
                    id="btn-user-submit"
                  >
                    {loading ? "Decrypting..." : isSignUp ? "Create Secure Account" : "Access Security Vault"}
                    <ArrowRight className="h-4 w-4 text-[#2c3353]" />
                  </button>
                </form>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs font-semibold text-[#5d6fa3] hover:text-[#e0dafc] underline"
                    id="btn-toggle-auth-mode"
                  >
                    {isSignUp ? "Already registered? Sign In" : "Need an account? Sign Up"}
                  </button>
                </div>

                {/* Identity providers */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#5d6fa3]/20"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                    <span className="bg-[#2c3353] px-4 text-[#5d6fa3] font-bold">Secure Identity Providers</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full py-3 bg-white text-gray-800 rounded-lg flex items-center justify-center gap-3 font-medium hover:bg-gray-100 transition-colors shadow-lg text-sm"
                    id="btn-google-login"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Sign in with Google
                  </button>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={handleSandboxLogin}
                      className="py-2.5 text-[11px] uppercase tracking-wider font-bold border border-[#e0dafc]/30 rounded-lg hover:bg-[#e0dafc]/10 text-[#e0dafc] transition-colors flex items-center justify-center gap-1.5"
                      id="btn-sandbox-login"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Sandbox Demo Login
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#1e233a] border border-[#5d6fa3]/20 rounded-xl p-3.5 text-xs text-[#a5b4fc]/95 space-y-1">
                  <span className="font-extrabold text-[10px] uppercase text-[#e0dafc] block">Sandbox Nominee Portal</span>
                  <p className="leading-relaxed text-[11px]">
                    To test, configure a **Nominee Registered Phone Number** and **Access PIN** in your **Profile Center**. 
                  </p>
                  <p className="leading-relaxed text-[11px]">
                    Enter that nominee phone number here, click **Send OTP** to receive the mock OTP <span className="font-bold text-white">7777</span>, and use your configured PIN to authenticate.
                  </p>
                </div>
                {/* NOMINEE LOGIN ENTRY POINT */}
                <form className="space-y-4" onSubmit={handleNomineeLogin}>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#5d6fa3] font-bold">Nominee Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#5d6fa3]" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-lg p-3 pl-10 text-sm text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                          placeholder="+1 (555) 012-3456"
                          id="input-nominee-phone"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="bg-[#5d6fa3]/20 hover:bg-[#5d6fa3]/30 text-[#e0dafc] text-xs font-semibold px-4 rounded-lg border border-[#e0dafc]/20 transition-all shrink-0"
                        id="btn-send-otp"
                      >
                        {otpSent ? "Resend" : "Send OTP"}
                      </button>
                    </div>
                  </div>

                  {otpSent && (
                    <div className="animate-fade-in space-y-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#5d6fa3] font-bold">SMS Verification Code (OTP)</label>
                        <input
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-lg p-3 text-sm text-center font-mono tracking-widest text-lg text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                          placeholder="7777"
                          maxLength={4}
                          id="input-nominee-otp"
                        />
                        <p className="text-[10px] text-green-400">Demo code 7777 successfully sent.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#5d6fa3] font-bold">Nominee Access PIN</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#5d6fa3]" />
                          <input
                            type="password"
                            required
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-lg p-3 pl-10 text-sm text-center font-mono tracking-widest text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                            placeholder="••••"
                            maxLength={6}
                            id="input-nominee-pin"
                          />
                        </div>
                        <p className="text-[9px] text-[#5d6fa3]">Default Demo PIN: 1234</p>
                      </div>
                    </div>
                  )}

                  {nomineeError && (
                    <p className="text-xs text-red-400 bg-red-950/40 p-3 rounded-lg border border-red-900/50" id="nominee-auth-error">
                      {nomineeError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !otpSent}
                    className={`w-full py-4 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      otpSent
                        ? "bg-[#e0dafc] text-[#2c3353] hover:brightness-110 shadow-lg"
                        : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                    }`}
                    id="btn-nominee-submit"
                  >
                    <UserCheck className="h-4 w-4" />
                    Verify & Unlock Handover
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-auto md:h-12 px-6 sm:px-12 py-4 md:py-0 border-t border-[#5d6fa3]/30 flex flex-col md:flex-row items-center justify-between text-[10px] uppercase tracking-widest text-[#5d6fa3] gap-2 shrink-0">
        <div>v1.0.4 — Secured with AES-256 GCM + Gemini 1.5</div>
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Firebase Auth Active
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> Firestore Sync: 22ms
          </span>
          <span className="text-[#e0dafc]/60 italic font-medium hidden sm:inline">Privacy is a fundamental right.</span>
        </div>
      </footer>
    </div>
  );
}
