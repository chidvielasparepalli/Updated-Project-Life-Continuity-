import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export type Theme = "light" | "dark";

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളం" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", nativeName: "অसमীয়া" },
  { code: "ur", name: "Urdu", nativeName: "اردو" }
];

interface ThemeLanguageContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  languages: LanguageOption[];
  isTranslating: boolean;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    // Brand
    brandName: "LifeContinuity AI",
    brandTagline: "Family Vital Assets & Care Playbooks",
    brandBadge: "Active",
    secureSession: "Secure Session",
    hello: "Hello",
    appStatus: "App status",
    online: "Online",
    logout: "Log Out",

    // Tabs
    tabDashboard: "Dashboard",
    tabProfile: "Profile",
    tabVault: "Vault",
    tabGmailSync: "Gmail Sync",
    tabSafetyCheckIn: "Safety Check-in",
    tabEmergencyActivation: "Emergency Center",
    tabReminderAgent: "Reminder Agent",
    tabCalendarSync: "Calendar Sync",
    tabSafetyPanel: "Playbook Settings",
    tabNomineeDashboard: "Nominee Portal",

    // Headings
    titleDashboard: "Personal Life Graph",
    titleProfile: "Emergency Profile & Security Center",
    titleVault: "Secure Document Vault",
    titleGmailSync: "Gmail Timeline Extractor",
    titleSafetyCheckIn: "Daily Proof-of-life Monitor",
    titleEmergencyActivation: "Emergency Command Center",
    titleReminderAgent: "Daily Notification Agents",
    titleCalendarSync: "Google Calendar Synchronization",
    titleSafetyPanel: "Safety Panel & Playbook Settings",
    titleNomineeDashboard: "Nominee Handover Portal Preview",

    // Login page
    loginIntro: "LifeContinuity securely organizes the important parts of your life before an emergency ever happens.",
    loginTitle: "LifeContinuity securely organizes the important parts of your life before an emergency ever happens.",
    welcomeBack: "Welcome Back",
    portalDesc: "Secure access to your personal life graph",
    userPortal: "User Portal",
    nomineePortal: "Nominee Portal",
    emailPlaceholder: "your-email@domain.com",
    passPlaceholder: "Password",
    phonePlaceholder: "Nominee Phone Number",
    loginBtn: "Authenticate Session",
    systemStatus: "System Status: Operational",
    
    // Check in buttons & instructions
    imSafeBtn: "I Am Safe — Check In Now",
    imSafeBtnRelocated: "I'm Safe — Go to Playbook Page",
    goToPlaybookBtn: "Go to Playbook & Safety Settings",
    clickToNavigate: "Clicking this navigates you directly to your Playbook Settings page.",

    // General
    loading: "Loading...",
    error: "Error",
    success: "Success",
    saveChanges: "Save Changes",
    search: "Search...",
    themeSelector: "Toggle Theme",
    languageSelector: "Language"
  },
  es: {
    // Brand
    brandName: "LifeContinuity AI",
    brandTagline: "Activos Vitales Familiares y Guías de Cuidado",
    brandBadge: "Activo",
    secureSession: "Sesión Segura",
    hello: "Hola",
    appStatus: "Estado de la app",
    online: "En línea",
    logout: "Cerrar sesión",

    // Tabs
    tabDashboard: "Tablero",
    tabProfile: "Perfil",
    tabVault: "Bóveda",
    tabGmailSync: "Sincronizar Gmail",
    tabSafetyCheckIn: "Prueba de Vida",
    tabEmergencyActivation: "Centro de Emergencia",
    tabReminderAgent: "Agente de Recordatorios",
    tabCalendarSync: "Sincronizar Calendario",
    tabSafetyPanel: "Configuración de Guía",
    tabNomineeDashboard: "Portal del Nominado",

    // Headings
    titleDashboard: "Gráfico de Vida Personal",
    titleProfile: "Perfil de Emergencia y Centro de Seguridad",
    titleVault: "Bóveda Segura de Documentos",
    titleGmailSync: "Extractor de Línea de Tiempo de Gmail",
    titleSafetyCheckIn: "Monitor Diario de Prueba de Vida",
    titleEmergencyActivation: "Centro de Comando de Emergencia",
    titleReminderAgent: "Agentes de Notificación Diaria",
    titleCalendarSync: "Sincronización de Google Calendar",
    titleSafetyPanel: "Panel de Seguridad y Configuración",
    titleNomineeDashboard: "Vista Previa del Portal de Entrega del Nominado",

    // Login page
    loginIntro: "LifeContinuity organiza de forma segura las partes importantes de su vida antes de que ocurra una emergencia.",
    loginTitle: "LifeContinuity organiza de forma segura las partes importantes de su vida antes de que ocurra una emergencia.",
    welcomeBack: "Bienvenido de nuevo",
    portalDesc: "Acceso seguro a su gráfico de vida personal",
    userPortal: "Portal de Usuario",
    nomineePortal: "Portal del Nominado",
    emailPlaceholder: "correo@dominio.com",
    passPlaceholder: "Contraseña",
    phonePlaceholder: "Número de Teléfono del Nominado",
    loginBtn: "Autenticar Sesión",
    systemStatus: "Estado del Sistema: Operativo",

    // Check in buttons & instructions
    imSafeBtn: "Estoy a Salvo — Registrar Ahora",
    imSafeBtnRelocated: "Estoy a Salvo — Ir al Libro de Jugadas",
    goToPlaybookBtn: "Ir a la Configuración del Libro de Jugadas",
    clickToNavigate: "Al hacer clic aquí, se le redirigirá directamente a la página de Configuración de su Libro de Jugadas.",

    // General
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    saveChanges: "Guardar Cambios",
    search: "Buscar...",
    themeSelector: "Cambiar Tema",
    languageSelector: "Idioma"
  },
  hi: {
    // Brand
    brandName: "LifeContinuity AI",
    brandTagline: "पारिवारिक महत्वपूर्ण संपत्ति और देखभाल पुस्तिका",
    brandBadge: "सक्रिय",
    secureSession: "सुरक्षित सत्र",
    hello: "नमस्ते",
    appStatus: "ऐप स्थिति",
    online: "ऑनलाइन",
    logout: "लॉग आउट",

    // Tabs
    tabDashboard: "डैशबोर्ड",
    tabProfile: "प्रोफ़ाइल",
    tabVault: "वॉल्ट",
    tabGmailSync: "जीमेल सिंक",
    tabSafetyCheckIn: "सुरक्षा चेक-इन",
    tabEmergencyActivation: "आपातकालीन केंद्र",
    tabReminderAgent: "अनुस्मारक एजेंट",
    tabCalendarSync: "कैलेंडर सिंक",
    tabSafetyPanel: "प्लेबुक सेटिंग्स",
    tabNomineeDashboard: "नॉमिनी पोर्टल",

    // Headings
    titleDashboard: "व्यक्तिगत जीवन ग्राफ",
    titleProfile: "आपातकालीन प्रोफ़ाइल और सुरक्षा केंद्र",
    titleVault: "सुरक्षित दस्तावेज़ वॉल्ट",
    titleGmailSync: "जीमेल टाइमलाइन एक्सट्रैक्टर",
    titleSafetyCheckIn: "दैनिक जीवन-प्रमाण मॉनिटर",
    titleEmergencyActivation: "आपातकालीन कमान केंद्र",
    titleReminderAgent: "दैनिक अधिसूचना एजेंट",
    titleCalendarSync: "गूगल कैलेंडर सिंक्रनाइज़ेशन",
    titleSafetyPanel: "सुरक्षा पैनल और प्लेबुक सेटिंग्स",
    titleNomineeDashboard: "नॉमिनी हैंडओवर पोर्टल पूर्वावलोकन",

    // Login page
    loginIntro: "लाइफकंटीन्यूटी किसी भी आपातकालीन स्थिति से पहले आपके जीवन के महत्वपूर्ण हिस्सों को सुरक्षित रूप से व्यवस्थित करती है।",
    loginTitle: "लाइफकंटीन्यूटी किसी भी आपातकालीन स्थिति से पहले आपके जीवन के महत्वपूर्ण हिस्सों को सुरक्षित रूप से व्यवस्थित करती है।",
    welcomeBack: "वापसी पर स्वागत है",
    portalDesc: "आपके व्यक्तिगत जीवन ग्राफ तक सुरक्षित पहुंच",
    userPortal: "उपयोगकर्ता पोर्टल",
    nomineePortal: "नॉमिनी पोर्टल",
    emailPlaceholder: "your-email@domain.com",
    passPlaceholder: "पासवर्ड",
    phonePlaceholder: "नॉमिनी का फोन नंबर",
    loginBtn: "सत्र प्रमाणित करें",
    systemStatus: "सिस्टम स्थिति: चालू",

    // Check in buttons & instructions
    imSafeBtn: "मैं सुरक्षित हूँ — अभी चेक इन करें",
    imSafeBtnRelocated: "मैं सुरक्षित हूँ — प्लेबुक पेज पर जाएँ",
    goToPlaybookBtn: "प्लेबुक और सुरक्षा सेटिंग्स पर जाएँ",
    clickToNavigate: "इस पर क्लिक करने से आप सीधे अपने प्लेबुक सेटिंग्स पेज पर पहुंच जाएंगे।",

    // General
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    saveChanges: "परिवर्तन सहेजें",
    search: "खोजें...",
    themeSelector: "थीम बदलें",
    languageSelector: "भाषा"
  },
  te: {
    // Brand
    brandName: "LifeContinuity AI",
    brandTagline: "కుటుంబ ముఖ్యమైన ఆస్తులు & సంరక్షణ నియమావళి",
    brandBadge: "క్రియాశీల",
    secureSession: "సురక్షిత సెషన్",
    hello: "నమస్కారం",
    appStatus: "యాప్ స్థితి",
    online: "ఆన్‌లైన్",
    logout: "లాగ్ అవుట్",

    // Tabs
    tabDashboard: "డ్యాష్‌బోర్డ్",
    tabProfile: "ప్రొఫైల్",
    tabVault: "వాల్ట్",
    tabGmailSync: "జిమెయిల్ సింక్",
    tabSafetyCheckIn: "సేఫ్టీ చెక్-ఇన్",
    tabEmergencyActivation: "ఎమర్జెన్సీ సెంటర్",
    tabReminderAgent: "రిమైండర్ ఏజెంట్",
    tabCalendarSync: "క్యాలెండర్ సింక్",
    tabSafetyPanel: "ప్లేబుక్ సెట్టింగ్‌లు",
    tabNomineeDashboard: "నామినీ పోర్టల్",

    // Headings
    titleDashboard: "వ్యectిగత జీవిత గ్రాఫ్",
    titleProfile: "ఎమర్జెన్సీ ప్రొఫైల్ & సెక్యూరిటీ సెంటర్",
    titleVault: "సురక్షిత డాక్యుమెంట్ వాల్ట్",
    titleGmailSync: "జిమెయిల్ టైమ్‌లైన్ ఎక్స్‌ట్రాక్టర్",
    titleSafetyCheckIn: "రోజువారీ ప్రూఫ్-ఆఫ్-లైఫ్ మానిటర్",
    titleEmergencyActivation: "ఎమర్జెన్సీ కమాండ్ సెంటర్",
    titleReminderAgent: "రోజువారీ నోటిఫికేషన్ ఏజెంట్లు",
    titleCalendarSync: "గూగుల్ క్యాలెండర్ సింక్రొనైజేషన్",
    titleSafetyPanel: "సేఫ్టీ ప్యానెల్ & ప్లేబుక్ సెట్టింగ్‌లు",
    titleNomineeDashboard: "నామినీ హ్యాండోవర్ పోర్టల్ ప్రివ్యూ",

    // Login page
    loginIntro: "లైఫ్‌కంటిన్యూటీ అత్యవసర పరిస్థితి రాకముందే మీ జీవితంలోని ముఖ్యమైన భాగాలను సురక్షితంగా నిర్వహిస్తుంది.",
    loginTitle: "లైఫ్‌కంటిన్యూటీ అత్యవసర పరిస్థితి రాకముందే మీ జీవితంలోని ముఖ్యమైన భాగాలను సురక్షితంగా నిర్వహిస్తుంది.",
    welcomeBack: "మళ్ళీ స్వాగతం",
    portalDesc: "మీ వ్యక్తిగత జీవిత గ్రాఫ్‌కు సురక్షిత ప్రాప్యత",
    userPortal: "వినియోగదారు పోర్టల్",
    nomineePortal: "నామినీ పోర్టల్",
    emailPlaceholder: "your-email@domain.com",
    passPlaceholder: "పాస్‌వర్డ్",
    phonePlaceholder: "నామినీ ఫోన్ నంబర్",
    loginBtn: "సెషన్ ప్రామాణీకరించు",
    systemStatus: "సిస్టమ్ స్థితి: పని చేస్తోంది",

    // Check in buttons & instructions
    imSafeBtn: "నేను సురక్షితంగా ఉన్నాను — ఇప్పుడే చెక్ ఇన్ చేయండి",
    imSafeBtnRelocated: "నేను సురక్షితంగా ఉన్నాను — ప్లేబుక్ పేజీకి వెళ్ళండి",
    goToPlaybookBtn: "ప్లేబుక్ & సేఫ్టీ సెట్టింగ్‌లకు వెళ్ళండి",
    clickToNavigate: "దీనిపై క్లిక్ చేయడం ద్వారా మీరు నేరుగా మీ ప్లేబుక్ సెట్టింగ్‌ల పేజీకి వెళారు.",

    // General
    loading: "లోడ్ అవుతోంది...",
    error: "లోపం",
    success: "విజయం",
    saveChanges: "మార్పులను సేవ్ చేయి",
    search: "వెతకండి...",
    themeSelector: "థీమ్ మార్చు",
    languageSelector: "భాష"
  }
};

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("app-theme");
    return (saved as Theme) || "dark";
  });

  const [language, setLanguage] = useState<string>(() => {
    const saved = localStorage.getItem("app-lang");
    return saved || "en";
  });

  const [translationsCache, setTranslationsCache] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("app-lang-cache");
    return saved ? JSON.parse(saved) : {};
  });

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const pendingRequests = useRef<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem("app-theme", theme);
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("app-lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("app-lang-cache", JSON.stringify(translationsCache));
  }, [translationsCache]);

  // DOM Translation Engine
  useEffect(() => {
    if (language === "en") {
      // Restore all original text
      const elements = document.querySelectorAll("[data-original-text]");
      elements.forEach(el => {
        const htmlElement = el as HTMLElement;
        if (htmlElement.dataset.originalText) {
          if (htmlElement.childNodes.length === 1 && htmlElement.childNodes[0].nodeType === Node.TEXT_NODE) {
            htmlElement.textContent = htmlElement.dataset.originalText;
          }
        }
      });
      return;
    }

    const langOption = LANGUAGES.find(l => l.code === language);
    if (!langOption) return;

    const translateDOM = async () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            
            const tagName = parent.tagName.toLowerCase();
            if (["script", "style", "textarea", "input", "svg", "path", "option"].includes(tagName)) {
              return NodeFilter.FILTER_REJECT;
            }
            
            if (parent.closest(".lucide") || parent.closest("svg") || parent.id === "select-app-language" || parent.id === "btn-login-toggle-language") {
              return NodeFilter.FILTER_REJECT;
            }

            const text = node.nodeValue?.trim();
            if (!text || text.length <= 1) return NodeFilter.FILTER_REJECT;
            
            if (parent.dataset.translatedLang === language) {
              return NodeFilter.FILTER_REJECT;
            }

            const isNumeric = /^\d+(\.\d+)?$/.test(text);
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
            const isDateOrTime = /^\d{4}-\d{2}-\d{2}$|^\d{1,2}:\d{2}\s?(AM|PM)?$/i.test(text);
            const isShortOrSymbols = text.length <= 1 || /^[^a-zA-Z0-9\s]+$/.test(text);
            if (isNumeric || isEmail || isDateOrTime || isShortOrSymbols) {
              return NodeFilter.FILTER_REJECT;
            }

            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const nodesToTranslate: { node: Node; parent: HTMLElement; text: string }[] = [];
      let currentNode = walker.nextNode();
      while (currentNode) {
        const text = currentNode.nodeValue?.trim();
        if (text) {
          nodesToTranslate.push({
            node: currentNode,
            parent: currentNode.parentElement as HTMLElement,
            text
          });
        }
        currentNode = walker.nextNode();
      }

      if (nodesToTranslate.length === 0) return;

      const uniqueTexts = Array.from(new Set(nodesToTranslate.map(n => n.text)));
      const textsToRequest = uniqueTexts.filter(text => {
        const cacheKey = `${language}_${text}`;
        return !translationsCache[cacheKey] && !pendingRequests.current.has(cacheKey);
      });

      // Populate already cached texts first
      nodesToTranslate.forEach(({ node, parent, text }) => {
        const cacheKey = `${language}_${text}`;
        if (translationsCache[cacheKey]) {
          if (!parent.dataset.originalText) {
            parent.dataset.originalText = text;
          }
          parent.dataset.translatedLang = language;
          node.nodeValue = translationsCache[cacheKey];
        }
      });

      if (textsToRequest.length === 0) return;

      try {
        setIsTranslating(true);
        textsToRequest.forEach(t => pendingRequests.current.add(`${language}_${t}`));

        const textMap: Record<string, string> = {};
        textsToRequest.forEach(text => {
          textMap[text] = text;
        });

        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textMap, targetLanguage: langOption.name })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.translated) {
            setTranslationsCache(prev => {
              const updated = { ...prev };
              textsToRequest.forEach(text => {
                const cacheKey = `${language}_${text}`;
                if (data.translated[text]) {
                  updated[cacheKey] = data.translated[text];
                }
              });
              return updated;
            });

            // Apply translation immediately to the current matched nodes
            nodesToTranslate.forEach(({ node, parent, text }) => {
              const cacheKey = `${language}_${text}`;
              const translatedVal = data.translated[text] || translationsCache[cacheKey];
              if (translatedVal && translatedVal !== text) {
                if (!parent.dataset.originalText) {
                  parent.dataset.originalText = text;
                }
                parent.dataset.translatedLang = language;
                node.nodeValue = translatedVal;
              }
            });
          }
        }
      } catch (err) {
        console.error("DOM batch translation failed", err);
      } finally {
        textsToRequest.forEach(t => pendingRequests.current.delete(`${language}_${t}`));
        if (pendingRequests.current.size === 0) {
          setIsTranslating(false);
        }
      }
    };

    translateDOM();

    const observer = new MutationObserver(() => {
      translateDOM();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [language, translationsCache]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const translateTextBackground = async (text: string, targetLangCode: string, targetLangName: string) => {
    const cacheKey = `${targetLangCode}_${text}`;
    if (pendingRequests.current.has(cacheKey)) return;
    pendingRequests.current.add(cacheKey);
    setIsTranslating(true);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage: targetLangName })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.translated) {
          setTranslationsCache(prev => ({
            ...prev,
            [cacheKey]: data.translated
          }));
        }
      }
    } catch (err) {
      console.error("Background translation failed", err);
    } finally {
      pendingRequests.current.delete(cacheKey);
      if (pendingRequests.current.size === 0) {
        setIsTranslating(false);
      }
    }
  };

  const t = (text: string): string => {
    if (!text) return "";

    const textTrimmed = text.trim();
    if (!textTrimmed) return text;

    // 1. Check if it's a known static key (e.g., "brandName") in the current language
    const staticDict = translations[language];
    if (staticDict && staticDict[text]) {
      return staticDict[text];
    }

    // 2. Check if it's the English value of a static key (e.g. text is "Dashboard")
    const enDict = translations["en"];
    const staticKey = Object.keys(enDict).find(k => enDict[k] === text);
    if (staticKey && staticDict && staticDict[staticKey]) {
      return staticDict[staticKey];
    }

    if (language === "en") {
      if (enDict && enDict[text]) {
        return enDict[text];
      }
      return text;
    }

    const isNumeric = /^\d+(\.\d+)?$/.test(textTrimmed);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textTrimmed);
    const isDateOrTime = /^\d{4}-\d{2}-\d{2}$|^\d{1,2}:\d{2}\s?(AM|PM)?$/i.test(textTrimmed);
    const isShortOrSymbols = textTrimmed.length <= 1 || /^[^a-zA-Z0-9\s]+$/.test(textTrimmed);

    if (isNumeric || isEmail || isDateOrTime || isShortOrSymbols) {
      return text;
    }

    // 3. Check dynamic translation cache
    const cacheKey = `${language}_${text}`;
    if (translationsCache[cacheKey]) {
      return translationsCache[cacheKey];
    }

    // 4. Trigger background translation via Gemini
    const langOption = LANGUAGES.find(l => l.code === language);
    if (langOption) {
      translateTextBackground(text, language, langOption.name);
    }

    return text;
  };

  return (
    <ThemeLanguageContext.Provider value={{ 
      theme, 
      toggleTheme, 
      language, 
      setLanguage, 
      t, 
      languages: LANGUAGES, 
      isTranslating 
    }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error("useThemeLanguage must be used within a ThemeLanguageProvider");
  }
  return context;
};
