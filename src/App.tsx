import React, { useState, useEffect } from "react";
import { 
  Shield, 
  LayoutDashboard, 
  KeyRound, 
  FolderOpen, 
  Mail, 
  ShieldAlert, 
  HeartPulse, 
  Bell, 
  LogOut, 
  CheckCircle, 
  Calendar, 
  Sliders, 
  Eye,
  Plus,
  MessageSquare,
  Sparkles,
  Sun,
  Moon,
  Languages
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import LoginScreen from "./components/LoginScreen";
import ProfileCenter from "./components/ProfileCenter";
import DocumentVault from "./components/DocumentVault";
import DataExtractor from "./components/DataExtractor";
import LifeGraphDashboard from "./components/LifeGraphDashboard";
import EmergencyCenter from "./components/EmergencyCenter";
import ReminderAgent from "./components/ReminderAgent";
import CheckInSystem from "./components/CheckInSystem";
import NomineeDashboard from "./components/NomineeDashboard";
import FloatingChatbot from "./components/FloatingChatbot";
import CalendarSync from "./components/CalendarSync";
import SafetyPanel from "./components/SafetyPanel";
import { useThemeLanguage } from "./components/ThemeLanguageContext";


type Tab =
  | "Dashboard"
  | "Profile"
  | "Vault"
  | "GmailSync"
  | "SafetyCheckIn"
  | "EmergencyActivation"
  | "ReminderAgent"
  | "CalendarSync"
  | "SafetyPanel"
  | "NomineeDashboard";

export default function App() {
  const { theme, toggleTheme, language, setLanguage, t, languages, isTranslating } = useThemeLanguage();
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<"user" | "nominee" | null>(null);
  
  // Nominee session state
  const [nomineeSession, setNomineeSession] = useState<{
    ownerUid: string;
    ownerName: string;
    nomineePhone: string;
  } | null>(null);

  const [currentTab, setCurrentTab] = useState<Tab>("Dashboard");
  const [checkInTriggerCounter, setCheckInTriggerCounter] = useState(0);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Sync state between dashboard safety check-ins and the full safety panel
  const handleCheckInTriggered = () => {
    setCheckInTriggerCounter((prev) => prev + 1);
  };

  const handleLoginSuccess = (sessionData: any, userRole: "user" | "nominee") => {
    setRole(userRole);
    if (userRole === "nominee") {
      setNomineeSession({
        ownerUid: sessionData.ownerUid,
        ownerName: sessionData.ownerName,
        nomineePhone: sessionData.nomineePhone
      });
    } else {
      setUser(sessionData);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    setNomineeSession(null);
    setCurrentTab("Dashboard");
  };

  // Capture Geolocation for Tab 9 location tracking
  useEffect(() => {
    if (user && navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await fetch("/api/location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid, latitude, longitude })
              });
            } catch (e) {
              console.error("Failed to write coordinates", e);
            }
          },
          (error) => {
            console.warn("Geolocation permission blocked or timed out.", error);
          }
        );
      } catch (err) {
        console.warn("Geolocation synchronous access blocked or failed:", err);
      }
    }
  }, [user]);

  if (!role) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (role === "nominee" && nomineeSession) {
    return (
      <>
        <NomineeDashboard
          ownerUid={nomineeSession.ownerUid}
          ownerName={nomineeSession.ownerName}
          nomineePhone={nomineeSession.nomineePhone}
          onLogout={handleLogout}
        />
        <FloatingChatbot uid={nomineeSession.ownerUid} isNominee={true} ownerUid={nomineeSession.ownerUid} />
      </>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-[#e0dafc] text-black theme-light-container" : "bg-[#2c3353] text-[#e0dafc] theme-dark-container"} flex flex-col relative pb-28 transition-colors duration-300`}>
      
      {/* Top Brand Header */}
      <header className={`${theme === "light" ? "bg-white border-b border-indigo-200" : "bg-[#2c3353] border-b border-[#5d6fa3]/30"} py-4 px-6 flex items-center justify-between shrink-0 shadow-md transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#e0dafc] rounded-xl flex items-center justify-center text-[#2c3353] shadow-md border border-indigo-300/30">
            <Shield className="h-5.5 w-5.5 text-indigo-700" />
          </div>
          <div>
            <h1 className="font-black text-base text-inherit tracking-tight flex items-center gap-1.5">
              {t("brandName")} <span className="text-[10px] bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-400/20 uppercase tracking-widest">{t("brandBadge")}</span>
            </h1>
            <p className="text-[10px] text-indigo-700/80 dark:text-indigo-200/80 font-medium hidden sm:block">{t("brandTagline")} • {t("secureSession")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Selector */}
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-inherit border border-transparent hover:border-[#5d6fa3]/30 transition-all cursor-pointer"
            title={t("themeSelector")}
            id="btn-toggle-theme"
          >
            {theme === "light" ? (
              <Moon className="h-4.5 w-4.5 text-indigo-700" />
            ) : (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            )}
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center bg-white/10 dark:bg-white/5 rounded-xl border border-[#5d6fa3]/10 hover:border-[#5d6fa3]/40 transition-all py-1.5 px-2.5 gap-2">
            <Languages className="h-4 w-4 text-indigo-500 dark:text-indigo-300 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-wider text-inherit border-none outline-none cursor-pointer pr-1"
              id="select-app-language"
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

          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs text-indigo-900 dark:text-indigo-100">{t("hello")} <span className="font-bold">{user.name}</span></span>
            <span className="text-[9px] text-[#5d6fa3] font-mono">{user.email}</span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t("secureSession")}
          </span>

          <button
            onClick={handleLogout}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-inherit transition-all cursor-pointer"
            title={t("logout")}
            id="btn-logout-header"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Tab Context Sub-Header */}
      <div className={`${theme === "light" ? "bg-white/60 border-b border-indigo-100" : "bg-[#2c3353]/45 border-b border-[#5d6fa3]/10"} py-2.5 px-6 flex items-center justify-between shrink-0 text-xs transition-colors duration-300`}>
        <h2 className="font-black text-inherit uppercase tracking-wider" id="header-tab-title">
          {currentTab === "Dashboard" && t("titleDashboard")}
          {currentTab === "Profile" && t("titleProfile")}
          {currentTab === "Vault" && t("titleVault")}
          {currentTab === "GmailSync" && t("titleGmailSync")}
          {currentTab === "SafetyCheckIn" && t("titleSafetyCheckIn")}
          {currentTab === "EmergencyActivation" && t("titleEmergencyActivation")}
          {currentTab === "ReminderAgent" && t("titleReminderAgent")}
          {currentTab === "CalendarSync" && t("titleCalendarSync")}
          {currentTab === "SafetyPanel" && t("titleSafetyPanel")}
          {currentTab === "NomineeDashboard" && t("titleNomineeDashboard")}
        </h2>
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#5d6fa3]">
          <span>{t("appStatus")}</span>
          <span className="text-green-500 dark:text-green-400 font-bold">{t("online")}</span>
        </div>
      </div>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {currentTab === "Dashboard" && (
              <LifeGraphDashboard
                uid={user.uid}
                onCheckInTriggered={handleCheckInTriggered}
                checkInTriggerCounter={checkInTriggerCounter}
                onNavigate={(tabName) => setCurrentTab(tabName as Tab)}
              />
            )}
            {currentTab === "Profile" && <ProfileCenter uid={user.uid} />}
            {currentTab === "Vault" && <DocumentVault uid={user.uid} />}
            {currentTab === "GmailSync" && <DataExtractor uid={user.uid} />}
            {currentTab === "SafetyCheckIn" && (
              <CheckInSystem
                uid={user.uid}
                onCheckInTriggered={handleCheckInTriggered}
                checkInTriggerCounter={checkInTriggerCounter}
                onNavigate={(tabName) => setCurrentTab(tabName as any)}
              />
            )}
            {currentTab === "EmergencyActivation" && <EmergencyCenter uid={user.uid} />}
            {currentTab === "ReminderAgent" && <ReminderAgent uid={user.uid} />}
            {currentTab === "CalendarSync" && <CalendarSync uid={user.uid} />}
            {currentTab === "SafetyPanel" && <SafetyPanel uid={user.uid} />}
            {currentTab === "NomineeDashboard" && (
              <NomineeDashboard
                ownerUid={user.uid}
                ownerName={user.name}
                nomineePhone={user.nomineePhone || "+1 (555) 019-2834"}
                onLogout={() => setCurrentTab("Dashboard")}
                isOwnerPreview={true}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>


      {/* Redesigned Floating Bottom Navigation Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-5xl bg-[#2c3353]/95 backdrop-blur-md rounded-2xl border border-[#5d6fa3]/30 shadow-2xl px-4 sm:px-6 py-2.5 z-40 flex items-center justify-between gap-1 sm:gap-2">
        {[
          { id: "Dashboard", label: t("tabDashboard"), icon: LayoutDashboard },
          { id: "Profile", label: t("tabProfile"), icon: KeyRound },
          { id: "Vault", label: t("tabVault"), icon: FolderOpen },
          { id: "GmailSync", label: t("tabGmailSync"), icon: Mail },
          { id: "CENTRAL_ACTION", label: "", icon: Plus, isCentral: true },
          { id: "SafetyPanel", label: t("tabSafetyPanel"), icon: Sliders },
          { id: "ReminderAgent", label: t("tabReminderAgent"), icon: Bell },
          { id: "CHAT_TOGGLE", label: "AI Chat", icon: MessageSquare, isChatToggle: true }
        ].map((item) => {
          const IconComp = item.icon;
          
          if (item.isCentral) {
            return (
              <div key={item.id} className="relative flex items-center justify-center px-1">
                {/* Popover overlay */}
                {showQuickAccess && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-80 bg-[#1e233a] border border-[#5d6fa3]/40 rounded-xl p-4 shadow-2xl z-50 animate-fade-in space-y-3">
                    <div className="flex items-center justify-between border-b border-[#5d6fa3]/20 pb-2">
                      <h4 className="text-[10px] font-black text-[#e0dafc] uppercase tracking-wider">Quick Safety Controls</h4>
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { tab: "SafetyCheckIn", title: "Proof-of-Life Check-In", desc: "Signal active presence & reset grace timer", color: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20", icon: CheckCircle },
                        { tab: "EmergencyActivation", title: "Emergency Handover", desc: "Instantly deploy plans and release vaults", color: "text-red-400 bg-red-950/40 border-red-500/20", icon: ShieldAlert },
                        { tab: "CalendarSync", title: "Calendar Sync", desc: "Import health appointments & timeline tasks", color: "text-blue-400 bg-blue-950/40 border-blue-500/20", icon: Calendar },
                        { tab: "NomineeDashboard", title: "Nominee Portal View", desc: "Audit live handover visibility", color: "text-indigo-400 bg-indigo-950/40 border-indigo-500/20", icon: Eye }
                      ].map((act, index) => {
                        const ActIcon = act.icon;
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentTab(act.tab as Tab);
                              setShowQuickAccess(false);
                            }}
                            className={`w-full flex items-start gap-2.5 p-2 rounded-lg border text-left transition-all hover:brightness-110 active:scale-[0.99] cursor-pointer ${act.color}`}
                          >
                            <ActIcon className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-white leading-tight">{act.title}</p>
                              <p className="text-[9px] text-[#e0dafc]/70 leading-normal">{act.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowQuickAccess(!showQuickAccess)}
                  className={`w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 hover:scale-105 active:scale-95 transition-all text-white flex items-center justify-center shadow-lg border border-indigo-400/40 relative z-50 cursor-pointer ${showQuickAccess ? "rotate-45" : ""}`}
                  title="Quick Controls"
                  id="btn-central-plus"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            );
          }

          if (item.isChatToggle) {
            return (
              <button
                key={item.id}
                onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                className={`flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  isChatbotOpen
                    ? "bg-[#e0dafc] text-[#2c3353] shadow-md font-bold"
                    : "text-indigo-200/80 hover:bg-white/5 hover:text-white"
                }`}
                id="btn-navbar-ai-chat"
              >
                <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 shrink-0" />
                <span className="text-[10px] hidden sm:inline font-bold">AI Chat</span>
              </button>
            );
          }

          const isSelected = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id as Tab);
                setShowQuickAccess(false);
              }}
              className={`flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#e0dafc] text-[#2c3353] shadow-md font-bold"
                  : "text-indigo-200/80 hover:bg-white/5 hover:text-white"
              }`}
              id={`navbar-tab-${item.id}`}
            >
              <IconComp className="h-4 sm:h-5 w-4 sm:w-5 shrink-0" />
              <span className="text-[10px] hidden sm:inline font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global floating context-synced Chatbot */}
      <FloatingChatbot 
        uid={user.uid} 
        externalOpen={isChatbotOpen} 
        onToggle={setIsChatbotOpen} 
      />

    </div>
  );
}
