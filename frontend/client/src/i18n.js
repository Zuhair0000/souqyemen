import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import your translation files DIRECTLY to ensure they load
import enJSON from "./locales/en.json";
import arJSON from "./locales/ar.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enJSON },
      ar: { translation: arJSON },
    },
    lng: "en", // Set default language explicitly to test
    fallbackLng: "en",

    // IMPORTANT: detailed debug logs to see what's wrong in console
    debug: true,

    interpolation: {
      escapeValue: false,
    },
    // IMPORTANT: Fixes the "white screen" or "no translation" issue
    react: {
      useSuspense: false,
    },
  });

export default i18n;
