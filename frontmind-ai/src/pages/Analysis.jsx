import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { auditFrontend } from "../utils/auditEngine";
import { fetchUrlSource } from "../services/urlAnalyzer";
import "./Analysis.css";

export default function Analysis() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("url");
  const [urlInput, setUrlInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const saveAndGoPreview = async ({ type, code = codeInput, file = fileName }) => {
  const cleanUrl = urlInput.trim();
  setErrorMessage("");
  setIsLoading(true);

  try {
    let sourceCode = code;

    if (type === "url") {
      if (!cleanUrl) {
        throw new Error("Ingresa una URL para continuar.");
      }

      sourceCode = await fetchUrlSource(cleanUrl);
    }

    if ((type === "code" || type === "zip") && !sourceCode.trim() && !file) {
      throw new Error("Pega código o carga un archivo para continuar.");
    }

    const report = auditFrontend({
      type,
      url: cleanUrl,
      code: sourceCode,
      fileName: file,
    });

    localStorage.setItem("analysisType", type);
    localStorage.setItem("urlInput", cleanUrl);
    localStorage.setItem("codeInput", sourceCode);
    localStorage.setItem("fileName", file);
    localStorage.setItem("auditReport", JSON.stringify(report));

    const history = JSON.parse(localStorage.getItem("analysisHistory") || "[]");

    const title = type === "url" ? cleanUrl : file || "Código pegado";

    const item = {
      id: Date.now(),
      title,
      type,
      score: report.globalScore,
      status: report.status,
      createdAt: report.createdAt,
    };

    localStorage.setItem(
      "analysisHistory",
      JSON.stringify([item, ...history].slice(0, 10))
    );

    navigate("/preview");
  } catch (error) {
    setErrorMessage(error.message || "Ocurrió un error al analizar.");
  } finally {
    setIsLoading(false);
  }
}; 

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage("");

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (["html", "css", "js", "jsx", "txt"].includes(extension)) {
      const reader = new FileReader();
      reader.onload = () => {
        setCodeInput(String(reader.result || ""));
      };
      reader.onerror = () => {
        setErrorMessage("No se pudo leer el archivo seleccionado.");
      };
      reader.readAsText(file);
    } else if (extension === "zip") {
      setCodeInput("");
    } else {
      setErrorMessage("Formato no permitido. Usa .zip, .html, .css, .js o .jsx.");
    }
  };

  return (
    <div className="analysis-page">
      <Sidebar />

      <main className="analysis-main">
        <div className="analysis-header">
          <h1>Nuevo análisis</h1>
          <p>Ingresa la URL de tu interfaz, pega código o carga un archivo del proyecto.</p>
        </div>

        <div className="analysis-content">
          <section className="analysis-left">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "url" ? "active" : ""}`}
                onClick={() => setActiveTab("url")}
              >
                Por URL
              </button>

              <button
                className={`tab ${activeTab === "code" ? "active" : ""}`}
                onClick={() => setActiveTab("code")}
              >
                Por Código / ZIP
              </button>
            </div>

            <div className="analysis-card">
              {errorMessage && <div className="form-alert">{errorMessage}</div>}

              {activeTab === "url" && (
                <>
                  <label>URL de la interfaz</label>

                  <input
                    type="text"
                    placeholder="https://ejemplo.com/mi-interfaz"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />

                    <button
                      className="analyze-btn"
                      onClick={() => saveAndGoPreview({ type: "url" })}
                      disabled={isLoading}
                    >
                      {isLoading ? "Analizando URL..." : "Cargar y analizar URL"}
                    </button>

                  <p className="info-text">
                    El sistema abrirá la URL en una vista previa y calculará reglas básicas según la entrada.
                  </p>

                  <div className="divider"><span>o</span></div>

                  <div className="examples">
                    <h3>Ejemplos rápidos</h3>
                    <div className="example-list">
                      <button onClick={() => setUrlInput("https://example.com/landing")}>Landing Page</button>
                      <button onClick={() => setUrlInput("https://example.com/shop")}>E-commerce</button>
                      <button onClick={() => setUrlInput("https://example.com/blog")}>Blog</button>
                      <button onClick={() => setUrlInput("https://example.com/dashboard")}>Dashboard</button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "code" && (
                <>
                  <label>Pegar código fuente</label>

                  <textarea
                    placeholder="Pega aquí tu código HTML, CSS o React..."
                    rows="10"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                  />

                  <button className="analyze-btn secondary-action" onClick={() => saveAndGoPreview({ type: "code" })}>
                    Analizar código
                  </button>

                  <div className="divider"><span>o</span></div>

                  <label>Cargar archivo del proyecto</label>

                  <div className="upload-box">
                    <input type="file" accept=".zip,.html,.css,.js,.jsx,.txt" onChange={handleFile} />
                    <p>Formatos permitidos: .zip, .html, .css, .js, .jsx</p>
                    {fileName && <p className="selected-file">Archivo seleccionado: {fileName}</p>}
                  </div>

                  <button
                    className="analyze-btn"
                    onClick={() => {
                      const extension = fileName.split(".").pop()?.toLowerCase();
                      saveAndGoPreview({ type: extension === "zip" ? "zip" : "code", code: codeInput, file: fileName });
                    }}
                  >
                    Cargar archivo y analizar
                  </button>

                  <p className="info-text">
                    Los archivos HTML/CSS/JS se leen directamente. Para ZIP, el MVP registra el archivo y mostrará una advertencia técnica.
                  </p>
                </>
              )}
            </div>
          </section>

          <section className="analysis-right">
            <div className="preview-card">
              <div className="browser-window">
                <div className="browser-top"><span></span><span></span><span></span></div>
                <div className="world-icon">WWW</div>
              </div>
              <div className="preview-glow"></div>
            </div>
            <div className="support-card">
              Soportamos páginas públicas por URL, código fuente y archivos frontend.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
