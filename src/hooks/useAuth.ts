import { useState, useEffect } from "react";
import { login, refreshToken, logout } from "@/lib/auth";

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    const { accessToken } = await login(email, password);
    setAccessToken(accessToken);
  };

  const handleLogout = async () => {
    await logout();
    setAccessToken(null);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { accessToken } = await refreshToken();
        setAccessToken(accessToken);
      } catch {
        setAccessToken(null);
      }
    }, 14 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { accessToken, handleLogin, handleLogout };
}
