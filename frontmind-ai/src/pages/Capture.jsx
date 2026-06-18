import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Capture.css";

export default function Capture() {
  const navigate = useNavigate();

  const captureResult = JSON.parse(localStorage.getItem("captureResult") || "null");
  const inputUrl = localStorage.getItem("inputUrl") || "Sin URL registrada";

  if (!captureResult) {
    return (
      <div className="layout">
        <Sidebar activeStep={2} />

        <main className="capture-main">
          <h1>Captura de interfaz</h1>
          <p>No existe una captura activa. Inicie una nueva evaluación.</p>

          <button className="secondary-btn" onClick={() => navigate("/input")}>
            Volver a entrada
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar activeStep={2} />

      <main className="capture-main">
        <section className="capture-content">
          <div className="page-header">
            <h1>Captura de interfaz</h1>
            <p>
              El sistema generó capturas automáticas de la interfaz en diferentes
              resoluciones para continuar con la evaluación frontend.
            </p>
          </div>

          <section className="source-card">
            <div>
              <span className="label">Fuente analizada</span>
              <strong>{inputUrl}</strong>
            </div>

            <div>
              <span className="label">Estado del proceso</span>
              <strong>Captura completada</strong>
            </div>
          </section>

          <section className="capture-card">
            <div className="card-header">
              <h2>Vistas generadas</h2>
              <span>{captureResult.total_captures} capturas</span>
            </div>

            <div className="capture-grid">
              {captureResult.captures.map((item) => (
                <div className="capture-item" key={item.device}>
                  <div className="capture-info">
                    <h3>{item.device}</h3>
                    <p>
                      {item.width} x {item.height}
                    </p>
                  </div>

                  <div className={`device-preview ${item.device}`}>
                    {item.public_url || item.file_name ? (
                      <img
                        src={
                          item.public_url
                            ? item.public_url
                            : `http://127.0.0.1:8000/captures/${item.file_name}`
                        }
                        alt={`Captura ${item.device}`}
                        className="device-img"
                      />
                    ) : (
                      <p>No se encontró la imagen</p>
                    )}
                 </div>

                  <span className="capture-status">Capturada</span>
                </div>
              ))}
            </div>
          </section>

          <div className="capture-actions">
            <button className="secondary-btn" onClick={() => navigate("/input")}>
              Volver
            </button>

            <button
              className="primary-btn"
              onClick={() => navigate("/html")}
            >
              Continuar
            </button>
          </div>
        </section>

        <aside className="summary-panel">
          <div className="summary-card">
            <h3>Estado de captura</h3>
            <span>Completado</span>
            <p>Las capturas fueron generadas correctamente.</p>
          </div>

          <div className="summary-card">
            <h3>Resoluciones generadas</h3>
            <span>{captureResult.total_captures}</span>
            <p>Desktop, tablet y mobile.</p>
          </div>

          <div className="summary-card">
            <h3>Fuente analizada</h3>
            <span>URL</span>
            <p>{inputUrl}</p>
          </div>
        </aside>
      </main>
    </div>
  );
}