import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { auditFrontend } from "../utils/auditEngine";
import "./Preview.css";

function buildSrcDoc(code) {
  const value = String(code || "");
  if (!value.trim()) return "<main style='font-family:Arial;padding:30px'><h1>Sin código para renderizar</h1></main>";

  const hasHtml = /<html|<body|<!doctype/i.test(value);
  if (hasHtml) return value;

  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body{font-family:Arial;margin:0;background:#f8fafc;color:#0f172a;}
        main{padding:28px;}
        button{background:#6d28d9;color:white;border:0;border-radius:8px;padding:10px 14px;}
      </style>
    </head>
    <body>
      ${value}
    </body>
  </html>`;
}

export default function Preview() {
  const navigate = useNavigate();
  const analysisType = localStorage.getItem("analysisType") || "url";
  const codeSaved = localStorage.getItem("codeInput") || "";
  const urlSaved = localStorage.getItem("urlInput") || "";
  const fileName = localStorage.getItem("fileName") || "";

  const srcDoc = useMemo(() => buildSrcDoc(codeSaved), [codeSaved]);

  const executeAudit = () => {
    const report = auditFrontend({
      type: analysisType,
      url: urlSaved,
      code: codeSaved,
      fileName,
    });

    localStorage.setItem("auditReport", JSON.stringify(report));
    navigate("/results");
  };

  return (
    <div className="preview-page">
      <Sidebar />

      <main className="preview-main">
        <div className="preview-header">
          <h1>Vista previa</h1>
          <p>Así se renderiza la interfaz antes del análisis técnico.</p>
        </div>

        {analysisType === "url" && (
          <section className="preview-card-full">
            <div className="preview-toolbar">
              <span>🔍</span>
              <input value={urlSaved || "Sin URL ingresada"} readOnly />
              <button onClick={() => window.location.reload()}>↻</button>
            </div>

            {urlSaved ? (
              <iframe
                className="url-preview-frame"
                title="Vista previa por URL"
                src={urlSaved}
              />
            ) : (
              <div className="empty-preview">No se ingresó ninguna URL.</div>
            )}

            <p className="preview-note">
              Algunas páginas pueden bloquear la vista previa por políticas de seguridad. El análisis se calcula sobre la entrada registrada.
            </p>
          </section>
        )}

        {(analysisType === "code" || analysisType === "zip") && (
          <section className="split-preview">
            <div className="code-panel">
              <h3>{analysisType === "zip" ? `Archivo ZIP: ${fileName}` : fileName ? `Archivo: ${fileName}` : "Código fuente"}</h3>
              <pre><code>{codeSaved || "No hay código visible para este archivo."}</code></pre>
            </div>

            <div className="render-panel">
              <h3>Vista previa renderizada</h3>
              {codeSaved ? (
                <iframe
                  className="code-preview-frame"
                  title="Vista previa del código"
                  srcDoc={srcDoc}
                />
              ) : (
                <div className="empty-preview">
                  No se puede renderizar el contenido del ZIP en este MVP porque no se está descomprimiendo en el navegador.
                </div>
              )}
            </div>
          </section>
        )}

        <div className="preview-actions">
          <button onClick={executeAudit}>Ejecutar análisis ISO 25010</button>
        </div>
      </main>
    </div>
  );
}
