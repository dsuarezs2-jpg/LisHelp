import { useMemo } from "react";
import Sidebar from "../components/Sidebar";
import "./Results.css";

const emptyReport = {
  globalScore: 0,
  status: "Sin análisis",
  dimensions: {
    Funcionalidad: 0,
    Rendimiento: 0,
    Compatibilidad: 0,
    Usabilidad: 0,
    Fiabilidad: 0,
    Seguridad: 0,
    Mantenibilidad: 0,
    Portabilidad: 0,
  },
  summary: { errors: 0, warnings: 0, goodPractices: 0, opportunities: 0 },
  issues: [],
  goodPractices: [],
  opportunities: [],
};

export default function Results() {
  const report = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("auditReport") || "null") || emptyReport;
    } catch {
      return emptyReport;
    }
  }, []);

  const dimensions = report.dimensions || emptyReport.dimensions;
  const summary = report.summary || emptyReport.summary;

  return (
    <div className="results-page">
      <Sidebar />

      <main className="results-main">
        <div className="results-header">
          <div>
            <h1>Resultados del análisis</h1>
            <p>
              {report.createdAt
                ? `Análisis completado: ${new Date(report.createdAt).toLocaleString()}`
                : "Aún no existe un análisis ejecutado."}
            </p>
          </div>
        </div>

        <div className="results-top">
          <section className="score-card">
            <h3>Puntaje global</h3>

            <div
              className="score-circle"
              style={{
                background: `conic-gradient(#4ade80 0deg, #4ade80 ${report.globalScore * 3.6}deg, #1e293b ${report.globalScore * 3.6}deg)`,
              }}
            >
              <div className="score-inner">
                <span className="score-number">{report.globalScore}</span>
                <span className="score-total">/100</span>
              </div>
            </div>

            <div className="score-status">{report.status}</div>
          </section>

          <section className="iso-card">
            <h3>Dimensiones ISO/IEC 25010</h3>

            <div className="iso-grid">
              {Object.entries(dimensions).map(([name, value]) => (
                <div className={`iso-item ${value < 80 ? "warning" : ""}`} key={name}>
                  <p>{name}</p>
                  <h2>{value}<span>/100</span></h2>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="summary-card">
          <h3>Resumen de problemas detectados</h3>

          <div className="summary-grid">
            <div className="summary-item error">
              <p>⛔ Errores</p>
              <h2>{summary.errors}</h2>
              <span>Problemas que afectan la calidad</span>
            </div>

            <div className="summary-item warning">
              <p>⚠ Advertencias</p>
              <h2>{summary.warnings}</h2>
              <span>Aspectos a mejorar</span>
            </div>

            <div className="summary-item success">
              <p>✔ Buenas prácticas</p>
              <h2>{summary.goodPractices}</h2>
              <span>Implementadas correctamente</span>
            </div>

            <div className="summary-item opportunity">
              <p>💡 Oportunidades</p>
              <h2>{summary.opportunities}</h2>
              <span>Mejoras sugeridas</span>
            </div>
          </div>
        </section>

        <section className="detail-card">
          <h3>Detalle del análisis</h3>

          {report.issues && report.issues.length > 0 ? (
            <div className="issue-list">
              {report.issues.map((issue, index) => (
                <div className={`issue-item ${issue.type}`} key={index}>
                  <strong>{issue.rule || "Regla detectada"}</strong>
                  <span>{issue.category || "General"}</span>
                  <p>{issue.message || "Observación generada por el análisis."}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-detail">
              No se detectaron problemas en el código analizado.
            </p>
          )}
        </section>

      </main>
    </div>
  );
}
