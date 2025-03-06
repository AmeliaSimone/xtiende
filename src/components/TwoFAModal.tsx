"use client";

import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControlLabel, Checkbox, Typography, Alert, Select, MenuItem } from "@mui/material";
import { toast } from "sonner";
import { startAuthentication } from "@simplewebauthn/browser";

interface TwoFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TwoFAModal: React.FC<TwoFAModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState("");
  const [isTrusted, setIsTrusted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("email"); // 📌 Método por defecto

  // 🔹 Enviar código según el método seleccionado
  const handleSendCode = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/send-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Código enviado a través de ${method}`);
      } else {
        setError(data.message || "Error al enviar código.");
      }
    } catch (error) {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verificar el código 2FA
  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError("El código debe tener 6 dígitos numéricos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, method, isTrusted }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Código verificado correctamente.");
        if (isTrusted) localStorage.setItem("trustedDevice", "true");
        onSuccess();
        onClose();
      } else {
        setError(data.message || "Código incorrecto o expirado.");
      }
    } catch (error) {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Manejo de autenticación WebAuthn (Face ID, Huella)
  const handleWebAuthn = async () => {
    try {
      const response = await fetch("/api/webauthn/generate-challenge");
      const challengeData = await response.json();

      const webAuthnResponse = await startAuthentication(challengeData);
      await fetch("/api/webauthn/verify-authentication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webAuthnResponse),
      });

      toast.success("Autenticación WebAuthn exitosa");
      onSuccess();
      onClose();
    } catch (error) {
      setError("Error en la autenticación WebAuthn.");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Verificación en Dos Pasos</DialogTitle>
      <DialogContent>
        <Typography>Selecciona un método de autenticación:</Typography>

        <Select fullWidth value={method} onChange={(e) => setMethod(e.target.value)}>
          <MenuItem value="email">Email</MenuItem>
          <MenuItem value="sms">SMS</MenuItem>
          <MenuItem value="authenticator">Google Authenticator</MenuItem>
          <MenuItem value="webauthn">WebAuthn (Huella/Face ID)</MenuItem>
        </Select>

        {/* 🔹 Botón para enviar código (No aplica para WebAuthn) */}
        {method !== "webauthn" && (
          <Button onClick={handleSendCode} color="primary" variant="outlined" disabled={loading} sx={{ mt: 2 }}>
            Enviar Código
          </Button>
        )}

        {/* 🔹 Botón especial para WebAuthn */}
        {method === "webauthn" && (
          <Button onClick={handleWebAuthn} color="primary" variant="contained" sx={{ mt: 2 }}>
            Autenticarse con WebAuthn
          </Button>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {/* 🔹 Campo de entrada para código 2FA (No necesario en WebAuthn) */}
        {method !== "webauthn" && (
          <TextField
            label="Código 2FA"
            variant="outlined"
            fullWidth
            margin="normal"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputProps={{ maxLength: 6, pattern: "[0-9]*", inputMode: "numeric" }}
          />
        )}

        {/* 🔹 Opción para recordar dispositivo */}
        <FormControlLabel
          control={<Checkbox checked={isTrusted} onChange={(e) => setIsTrusted(e.target.checked)} />}
          label="Recordar este dispositivo"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        {method !== "webauthn" && (
          <Button onClick={handleVerify} color="primary" variant="contained" disabled={loading}>
            {loading ? "Verificando..." : "Verificar"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TwoFAModal;
