"use client"; // 👈 Asegura que esto está en la primera línea

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextProps {
  user: any;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(() => null);
    const [accessToken, setAccessToken] = useState<string | null>(() => null);
    

  useEffect(() => {
    refreshAccessToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // 🔥 Asegura que las cookies se envíen en la petición
      });
  
      if (!res.ok) throw new Error("Error en el login");
  
      await res.json();
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };
  

  const refreshAccessToken = async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // 🔥 Enviar cookies en la petición
      });
  
      if (!res.ok) throw new Error("No se pudo refrescar el token");
  
      const data = await res.json();
      setAccessToken(data.accessToken);
  
      console.log("🔄 Nuevo accessToken recibido:", data.accessToken);
    } catch {
      console.log("❌ No se pudo refrescar el token. Cerrando sesión...");
      setAccessToken(null);
      setUser(null);
    }
  };
  
  useEffect(() => {
    if (!accessToken) {
      console.log("🔄 Intentando refrescar el accessToken...");
      refreshAccessToken();
    }
  }, []);

  
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAccessToken(null);
    setUser(null);
    sessionStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

export default AuthProvider;
