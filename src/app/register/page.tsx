"use client";

import { useState } from "react";
import { Container, TextField, Button, Box, Typography, Alert } from "@mui/material";
import UploadDocument from "@/components/UploadDocument";
import { createWorker } from "tesseract.js";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    idNumber: "",
  });

  const [documentValidated, setDocumentValidated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState(""); // 🔹 Guardar el texto extraído para depuración

  // 🔹 Manejar cambios en los inputs del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Manejar la subida de imagen del documento
  const handleFileChange = (file: File) => {
    setDocumentImage(file);
    setDocumentValidated(false);
    setErrorMessage("");
    setExtractedText(""); // Reiniciar texto extraído al cambiar la imagen
  };

  // 🔹 Función para limpiar y extraer el RUT/DNI
  const cleanExtractedText = (text: string) => {
    return text
      .replace(/[^0-9kK-]/g, "") // ✅ Extrae solo números, "K" y guiones (RUT chileno)
      .replace(/\s+/g, "") // ✅ Elimina espacios en blanco
      .trim();
  };

  // 🔹 Procesar la imagen con OCR
  const handleValidation = async () => {
    if (!documentImage) {
      setErrorMessage("Debes subir una imagen antes de validar.");
      return;
    }
  
    setLoading(true);
    setErrorMessage("");
  
    try {
      // ✅ Crear el worker con Tesseract.js
      const worker = await createWorker("spa+eng");
  
      // ✅ Realizar el reconocimiento OCR
      const { data } = await worker.recognize(documentImage);
      let text = data.text;
  
      setExtractedText(text); // 🔹 Mostrar el texto extraído en pantalla
      console.log("📜 Texto extraído por OCR:", text);
  
      // ✅ Intentamos extraer el RUT con una expresión regular
      const rutRegex = /(\d{1,2}\.?\d{3}\.?\d{3}-?[0-9kK])/g; // 📌 Detecta RUTs en distintos formatos
      const foundRuts = text.match(rutRegex); // 📌 Busca coincidencias en el texto
  
      if (!foundRuts || foundRuts.length === 0) {
        setErrorMessage("No se pudo detectar un RUT válido en la imagen. Intenta con otra imagen.");
        return;
      }
  
      const extractedRut = foundRuts[0].replace(/\./g, ""); // 📌 Quitamos los puntos (ej: 19.378.460-K → 19378460-K)
      console.log("✅ RUT extraído después de limpiar:", extractedRut);
  
      // ✅ Limpiar y comparar con el RUT ingresado
      const inputRut = formData.idNumber.replace(/\./g, "").toUpperCase(); // 📌 También limpiamos el RUT ingresado
      console.log("✅ RUT ingresado:", inputRut);
  
      if (extractedRut !== inputRut) {
        setErrorMessage(`El RUT detectado (${extractedRut}) no coincide con el ingresado (${inputRut}).`);
      } else {
        setDocumentValidated(true);
        setErrorMessage("");
      }
  
      await worker.terminate(); // ✅ Cerrar el worker para liberar memoria
    } catch (err) {
      setErrorMessage("Error al procesar la imagen.");
    } finally {
      setLoading(false);
    }
  };
  
  

  // 🔹 Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentValidated) {
      setErrorMessage("Debes validar tu documento antes de continuar.");
      return;
    }

    console.log("✅ Registro enviado con éxito:", formData);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h5">Registro</Typography>

        {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}

        {/* 🔹 Mostrar el texto extraído en pantalla para depurar */}
        {extractedText && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Texto detectado:</strong> {extractedText}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            label="Nombre"
            name="firstName"
            fullWidth
            margin="normal"
            value={formData.firstName}
            onChange={handleChange}
          />
          <TextField
            label="Apellido"
            name="lastName"
            fullWidth
            margin="normal"
            value={formData.lastName}
            onChange={handleChange}
          />
          <TextField
            label="DNI / RUT / RUC"
            name="idNumber"
            fullWidth
            margin="normal"
            value={formData.idNumber}
            onChange={handleChange}
          />

          {/* Componente de subida de documento */}
          <UploadDocument onFileSelect={handleFileChange} />

          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleValidation}
            disabled={loading}
          >
            {loading ? "Validando..." : "Validar Documento"}
          </Button>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={!documentValidated}>
            Registrarse
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
