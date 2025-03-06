import AuthProvider from "@/context/AuthContext";
import ClientWrapper from "@/components/ClientWrapper"; // 👈 Importamos el wrapper

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ClientWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClientWrapper>
      </body>
    </html>
  );
}
