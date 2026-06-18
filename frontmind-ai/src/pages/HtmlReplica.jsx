import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { replicateHtmlFromContent } from "../services/api";
import Sidebar from "../components/Sidebar";
import "./HtmlReplica.css";

export default function HtmlReplica() {
  const navigate = useNavigate();

  const inputUrl = localStorage.getItem("inputUrl") || "";
  const captureResult = JSON.parse(localStorage.getItem("captureResult") || "null");

  const [loading, setLoading] = useState(false);
  const [htmlData, setHtmlData] = useState(
    JSON.parse(localStorage.getItem("htmlReplication") || "null")
  );
  const [error, setError] = useState("");

  const htmlCode = useMemo(() => {
    return htmlData?.html_replication?.html_replicated || "";
  }, [htmlData]);

  useEffect(() => {
    async function loadHtmlReplica() {
      if (!inputUrl || htmlData) return;

      try {
        setLoading(true);
        const htmlContent = captureResult?.html_content || "";
        const result = await replicateHtmlFromContent(htmlContent, inputUrl);
        localStorage.setItem("htmlReplication", JSON.stringify(result));
        setHtmlData(result);
      } catch (err) {
        setError(err.message || "No se pudo generar el HTML.");
      } finally {
        setLoading(false);
      }
    }

    loadHtmlReplica();
  }, [inputUrl, htmlData]);

  const continueEvaluation = () => {
    localStorage.setItem("htmlEvaluated", htmlCode);
    navigate("/evaluation");
  };

  return (
    <div className="layout">
      <Sidebar activeStep={3} />

      <main className="html-main">
        <section className="html-content">
          <div className="page-header">
            <h1>HTML real o replicado</h1>
            <p>
              El sistema extrae o reconstruye la estructura HTML de la interfaz
              para su análisis estructural y semántico.
            </p>
          </div>

          {error && <div className="html-alert">{error}</div>}
          {loading && <div className="html-alert">Generando HTML evaluable...</div>}

          <section className="html-tabs">
            <button className="active">HTML real</button>
            <button>HTML replicado</button>
          </section>

          <section className="html-summary">
            <div>
              <span>Origen del HTML</span>
              <strong>{inputUrl || "Fuente local"}</strong>
            </div>

            <div>
              <span>Etiquetas detectadas</span>
              <strong>{htmlCode ? (htmlCode.match(/<[^/!][^>]*>/g) || []).length : 0}</strong>
            </div>

            <div>
              <span>Componentes identificados</span>
              <strong>{htmlCode ? (htmlCode.match(/<(header|nav|main|section|article|footer|form|button)/g) || []).length : 0}</strong>
            </div>

            <div>
              <span>Calidad estructural</span>
              <strong>{htmlCode ? "Validable" : "Pendiente"}</strong>
            </div>
          </section>

          <section className="html-workspace">
            <div className="code-panel">
              <div className="panel-title">
                <h3>Código HTML</h3>
                <button
                  onClick={() => {
                    const blob = new Blob([htmlCode], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "frontmind-html-evaluado.html";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Descargar .html
                </button>
              </div>

              <pre>
                <code>{htmlCode || "Aún no se generó HTML evaluable."}</code>
              </pre>
            </div>

            <div className="preview-panel">
              <div className="panel-title">
                <h3>Vista previa</h3>
              </div>

              <iframe
                title="Vista previa HTML"
                srcDoc={htmlCode}
              />
            </div>
          </section>

          <div className="html-actions">
            <button className="secondary-btn" onClick={() => navigate("/capture")}>
              Volver
            </button>

            <button className="secondary-btn" disabled={!htmlCode}>
              Validar estructura
            </button>

            <button className="primary-btn" onClick={continueEvaluation} disabled={!htmlCode}>
              Continuar a evaluación
            </button>
          </div>
        </section>

        <aside className="html-side">
          <div className="side-card">
            <h3>Tipo de HTML</h3>
            <strong>HTML5</strong>
            <p>{htmlData?.html_replication?.source || "Pendiente"}</p>
          </div>

          <div className="side-card">
            <h3>Capturas asociadas</h3>
            <strong>{captureResult?.total_captures || 0}</strong>
            <p>Desktop, tablet y mobile.</p>
          </div>

          <div className="side-card">
            <h3>Observaciones preliminares</h3>
            <ul>
              <li>Estructura lista para evaluación.</li>
              <li>Se conserva evidencia visual.</li>
              <li>No se modifica el código original.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}