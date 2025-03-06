"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { TextField, Button, Box, Typography, Container, Alert, Link } from "@mui/material";
import TwoFAModal from "@/components/TwoFAModal";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isTwoFAModalOpen, setIsTwoFAModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  if (!auth) return <Typography variant="h6">Error: `AuthContext` no está disponible.</Typography>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setError("Por favor, introduce un email válido.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      await auth.login(email, password);

      // Verifica si el dispositivo ya está confiable
      const isTrustedDevice = localStorage.getItem("trustedDevice");
      if (!isTrustedDevice) {
        setIsTwoFAModalOpen(true);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h5" suppressHydrationWarning>
          Iniciar Sesión
        </Typography>
        {error && <Alert severity="error" sx={{ width: "100%", mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Iniciar Sesión
          </Button>
        </Box>

        {/* 🔹 Enlace "¿Olvidaste tu contraseña?" */}
        <Box sx={{ mt: 2 }}>
          <Link href="/password-reset/request" underline="hover" color="primary">
            ¿Olvidaste tu contraseña?
          </Link>
        </Box>
      </Box>

      {/* Modal de 2FA */}
      <TwoFAModal 
        isOpen={isTwoFAModalOpen} 
        onClose={() => setIsTwoFAModalOpen(false)} 
        onSuccess={() => router.push("/dashboard")}
      />
    </Container>
  );
}
