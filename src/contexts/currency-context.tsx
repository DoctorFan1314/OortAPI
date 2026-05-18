"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";

type Currency = "USD" | "CNY";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  exchangeRate: number;
  formatPrice: (usdAmount: number, decimals?: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: () => {},
  exchangeRate: 7.3,
  formatPrice: (usd, decimals) => decimals ? `$${usd.toFixed(decimals)}` : `$${usd.toFixed(6)}`,
  symbol: "$",
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [exchangeRate, setExchangeRate] = useState(7.3);

  // Fetch settings from server and apply
  const fetchSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.currency) as Currency | null;
      if (stored && (stored === "USD" || stored === "CNY")) {
        setCurrencyState(stored);
      }
    } catch { /* ignore */ }

    fetch("/api/dashboard/settings", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.settings?.exchange_rate) {
          setExchangeRate(parseFloat(data.settings.exchange_rate) || 7.3);
        }
        if (data?.settings?.currency) {
          const serverCurrency = data.settings.currency as Currency;
          if (serverCurrency === "USD" || serverCurrency === "CNY") {
            const stored = localStorage.getItem(STORAGE_KEYS.currency);
            if (!stored) {
              setCurrencyState(serverCurrency);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSettings();

    // Re-fetch on focus to pick up settings changed on another page
    const handleFocus = () => fetchSettings();
    window.addEventListener("focus", handleFocus);

    // Listen for localStorage changes (e.g., from settings page)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.currency && e.newValue) {
        const val = e.newValue as Currency;
        if (val === "USD" || val === "CNY") setCurrencyState(val);
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchSettings]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEYS.currency, c);
    } catch { /* ignore */ }
  }, []);

  const symbol = currency === "CNY" ? "¥" : "$";

  const formatPrice = useCallback((usdAmount: number, decimals?: number) => {
    if (currency === "CNY") {
      return `¥${(usdAmount * exchangeRate).toFixed(decimals ?? 2)}`;
    }
    return `$${usdAmount.toFixed(decimals ?? 6)}`;
  }, [currency, exchangeRate]);

  const value = useMemo(
    () => ({ currency, setCurrency, exchangeRate, formatPrice, symbol }),
    [currency, setCurrency, exchangeRate, formatPrice, symbol],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
