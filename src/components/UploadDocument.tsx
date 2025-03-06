"use client";

import { useState } from "react";
import { Box, Button, Typography, Alert } from "@mui/material";
import Image from "next/image";

interface UploadDocumentProps {
  onFileSelect: (file: File) => void;
}

export default function UploadDocument({ onFileSelect }: UploadDocumentProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validar formato de imagen
      if (!file.type.startsWith("image/")) {
        setError("Debes subir una imagen válida (JPG, PNG).");
        return;
      }

      setPreview(URL.createObjectURL(file));
      setError("");
      onFileSelect(file);
    }
  };

  return (
    <Box sx={{ textAlign: "center", mt: 3 }}>
      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} id="upload-input" />
      <label htmlFor="upload-input">
        <Button variant="outlined" component="span">
          Subir Documento
        </Button>
      </label>

      {preview && (
        <Box sx={{ mt: 2 }}>
          <Image src={preview} alt="Documento" width={250} height={150} />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
}
