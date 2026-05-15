import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

async function bootstrap() {
  // Inicializa MSW em modo de desenvolvimento com mocks habilitados
  if (import.meta.env.VITE_MOCK_ENABLED === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass", // Não bloqueia requests não mockados (fonts, etc)
    });
    console.log("[Mock] 🔧 MSW ativo — API e Cognito mockados");
    console.log("[Mock] Credenciais disponíveis:");
    console.log("  Admin:     admin@escola.com / admin123");
    console.log("  Professor: professor@escola.com / prof123");
    console.log("  Aluno:     aluno@escola.com / aluno123");
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
