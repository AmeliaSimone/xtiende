"use client";

import { useState } from "react";
import { Container, TextField, Button, Box, Typography, Alert } from "@mui/material";
import { toast } from "sonner";

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Si el email está registrado, recibirás un enlace para restablecer tu contraseña.");
      } else {
        setMessage(data.message || "Error al solicitar la recuperación.");
      }
    } catch (error) {
      setMessage("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h5">Recuperar Contraseña</Typography>
        {message && <Alert severity="error" sx={{ width: "100%", mt: 2 }}>{message}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? "Enviando..." : "Enviar Instrucciones"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
