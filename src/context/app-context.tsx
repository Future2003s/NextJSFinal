"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

// Helper functions for cookie management
const getCookie = (name: string): string => {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
};

const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

type AppContextValue = {
  sessionToken: string;
  setSessionToken: (token: string) => void;
  logout: () => void; // Add logout function
};

const AppContext = createContext<AppContextValue>({
  sessionToken: "",
  setSessionToken: () => {},
  logout: () => {},
});

export const useAppContextProvider = () => {
  return useContext(AppContext);
};

export default function AppContextProvider({
  children,
  initialSessionToken = "",
}: {
  children: ReactNode;
  initialSessionToken?: string;
}) {
  const [sessionToken, setSessionTokenState] = useState(() => {
    const cookieToken = getCookie("sessionToken");
    return cookieToken || initialSessionToken;
  });

  const setSessionToken = useCallback((token: string) => {
    setSessionTokenState(token);
    setCookie("sessionToken", token, 30); // Store token in cookie for 30 days
  }, []);

  const logout = useCallback(() => {
    setSessionTokenState("");
    setCookie("sessionToken", "", -1); // Expire the cookie
  }, []);

  useEffect(() => {
    const currentToken = getCookie("sessionToken") || initialSessionToken;
    if (currentToken !== sessionToken) {
      setSessionTokenState(currentToken);
    }
  }, [initialSessionToken, sessionToken]);

  return (
    <AppContext.Provider value={{ sessionToken, setSessionToken, logout }}>
      {children}
    </AppContext.Provider>
  );
}
