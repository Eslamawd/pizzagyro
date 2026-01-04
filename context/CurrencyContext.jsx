"use client";
import { createContext, useContext, useState } from "react";
import { useLanguage } from "./LanguageContext";

const CurrencyContext = createContext();

const EgpIcon = (props) => (
  <span {...props} className={`font-semibold ${props.className || ""}`}>
    $
  </span>
);

const UsdIcon = (props) => (
  <span {...props} className={`font-semibold ${props.className || ""}`}>
    $
  </span>
);

export const CurrencyProvider = ({ children }) => {
  // 🏦 العملة الافتراضية: الجنيه المصري
  const [currency, setCurrency] = useState("USD");

  // 🔁 أسعار تحويل تجريبية (تقدر تجيبها من API لاحقًا)
  const [rates, setRates] = useState({
    EGP: 1, // الأساس
    USD: 1, // تقريبي
    SAR: 0.079,
  });

  const { lang } = useLanguage();

  // 🧮 التحويل
  const convertPrice = (amount, toCurrency = currency) => {
    if (!rates[toCurrency]) return amount;
    return amount * rates[toCurrency];
  };

  // 💵 تنسيق المبلغ مع الرمز المناسب
  const formatPrice = (amount, curr = currency) => {
    const converted = convertPrice(amount, curr);

    const formattedNumber = new Intl.NumberFormat(
      lang === "ar" ? "en-US" : "en-US",
      {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }
    ).format(converted);

    switch (curr) {
      case "EGP":
        return (
          <span className="inline-flex items-center gap-1">
            <span>{formattedNumber}</span>
            <EgpIcon className="" />
          </span>
        );
      case "USD":
        return (
          <span className="inline-flex items-center gap-1">
            <UsdIcon className="" />
            <span>{formattedNumber}</span>
          </span>
        );
      case "SAR":
        return (
          <span className="inline-flex items-center gap-1">
            <span>{formattedNumber}</span>
            <span className="text-white font-semibold">ر.س</span>
          </span>
        );
      default:
        return formattedNumber;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, formatPrice, convertPrice, rates }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
