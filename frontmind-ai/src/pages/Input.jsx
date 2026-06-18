import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { captureInterfaceByUrl, uploadZip } from "../services/api";
import "./Input.css";

export default function Input() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("url");
  const [url, setUrl] = useState("");
  const [zipFile, setZipFile] = useState(null);
  const [html, setHtml] = useState("");
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startAnalysis = async () => {
  setError("");

  if (activeTab === "url" && !url.trim()) {
    setError("Ingrese una URL válida.");
    return;
  }

  if (activeTab === "capture" && !zipFile) {
    setError("Seleccione un archivo ZIP.");
    return;
  }

  localStorage.clear();
  localStorage.setItem("inputType", activeTab);
  localStorage.setItem("inputUrl", url);
  localStorage.setItem("inputZip", imageName);

  if (activeTab === "url") {
    try {
      setLoading(true);

      const result = await captureInterfaceByUrl(url);

      localStorage.setItem("captureResult", JSON.stringify(result));
      navigate("/capture");
    } catch (err) {
      setError(err.message || "Error al capturar la URL.");
    } finally {
      setLoading(false);
    }

    return;
  }

  if (activeTab === "capture") {
    try {
      setLoading(true);

      const result = await uploadZip(zipFile);

      localStorage.setItem("zipResult", JSON.stringify(result));
      localStorage.setItem("captureResult", JSON.stringify(result));

      navigate("/capture");
    } catch (err) {
      setError(err.message || "Error al procesar el ZIP.");
    } finally {
      setLoading(false);
    }

    return;
  }
};

  return (
    <div className="layout">
      <Sidebar activeStep={1} />

      <main className="input-main">
        <section className="input-content">
          <div className="page-header">
            <h1>Entrada de análisis</h1>
            <p>
              Cargue una URL, captura o código HTML para iniciar la evaluación
              automática del frontend.
            </p>
          </div>

          <div className="input-card">
            <div className="tabs">
              <button
                className={activeTab === "url" ? "active" : ""}
                onClick={() => setActiveTab("url")}
              >
                Analizar por URL
              </button>

              <button
                className={activeTab === "capture" ? "active" : ""}
                onClick={() => setActiveTab("capture")}
              >
                Subir ZIP
              </button>

            </div>

            {error && <div className="alert">{error}</div>}

            {activeTab === "url" && (
              <div className="tab-content">
                <h2>Analizar por URL</h2>
                <p>
                  Ingrese la URL pública de la interfaz. El sistema capturará la
                  página y registrará evidencia visual.
                </p>

                <label>URL del sitio web</label>
                <input
                  type="text"
                  placeholder="https://ejemplo.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            {activeTab === "capture" && (
              <div className="tab-content">
                <h2>Subir ZIP</h2>
                <p>
                  Permite evaluar una interfaz cuando solo se dispone de una
                  imagen o evidencia visual.
                </p>

                <label>Archivo ZIP</label>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setZipFile(file);
                    setImageName(file.name);
                  }
                }}
                />

                {imageName && <strong>Archivo seleccionado: {imageName}</strong>}
              </div>
            )}


            <div className="options">
              <div>
                <input type="checkbox" defaultChecked />
                <span>Generar captura automática</span>
              </div>

              <div>
                <input type="checkbox" defaultChecked />
                <span>Evaluar criterios ISO/IEC 25010</span>
              </div>
            </div>

            <button className="primary-btn" onClick={startAnalysis} disabled={loading}>
              {loading ? "Capturando interfaz..." : "Iniciar análisis"}
            </button>
          </div>
        </section>

        <aside className="summary-panel">
          <div className="summary-card">
            <h3>Estado del proyecto</h3>
            <span>Sin iniciar</span>
            <p>Aún no se ha realizado ningún análisis.</p>
          </div>

          <div className="summary-card">
            <h3>Tipo de entrada</h3>
            <span>{activeTab === "url" ? "URL" : activeTab === "ZIP" ? "ZIP" : "ZIP"}</span>
            <p>Seleccione una fuente para continuar.</p>
          </div>

          <div className="summary-card">
            <h3>Motor de evaluación</h3>
            <span>FrontMind AI Engine</span>
            <p>Basado en criterios ISO/IEC 25010.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}