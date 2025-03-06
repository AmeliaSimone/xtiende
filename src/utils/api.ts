export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const accessToken = sessionStorage.getItem("accessToken"); // Obtener accessToken almacenado
  
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
  
    const res: Response = await fetch(url, { ...options, headers });
  
    // 🔄 Si el accessToken es inválido, intentar refrescarlo automáticamente
    if (res.status === 401) {
      console.log("🔄 Token expirado, intentando refrescar...");
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiFetch(url, options); // Reintentar la petición con el nuevo token
      }
    }
  
    return res;
  };
  
  // 🔥 Función para refrescar el accessToken automáticamente
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const res: Response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // ⚠️ IMPORTANTE: Permitir envío de cookies
      });
  
      if (!res.ok) {
        console.error("❌ No se pudo refrescar el token.");
        sessionStorage.removeItem("accessToken");
        return false;
      }
  
      const data: { accessToken: string } = await res.json();
      sessionStorage.setItem("accessToken", data.accessToken); // Guardar nuevo accessToken
      console.log("✅ Nuevo accessToken recibido:", data.accessToken);
      return true;
    } catch (error) {
      console.error("❌ Error al refrescar el token:", error);
      return false;
    }
  };
  