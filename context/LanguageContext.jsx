"use client";

import { createContext, useContext, useState, useCallback } from "react";

import en from "../public/locales/en/common.json";
import ar from "../public/locales/ar/common.json";

// كل الترجمات في object واحد
const translations = { en, ar };

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");

  // دالة الترجمة
  const t = useCallback((key) => translations[lang]?.[key] || key, [lang]);

  // toggle اللغة
  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// hook للاستخدام بسهولة
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
