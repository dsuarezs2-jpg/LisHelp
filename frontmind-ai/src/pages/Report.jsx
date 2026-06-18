import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Sidebar from "../components/Sidebar";
import "./Report.css";

export default function Report() {
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const inputUrl = localStorage.getItem("inputUrl") || "No registrado";
  const captureResult = JSON.parse(localStorage.getItem("captureResult") || "null");
  const reportData = JSON.parse(localStorage.getItem("technicalReport") || "null");
  const evaluationData = JSON.parse(localStorage.getItem("isoEvaluation") || "null");

  const report = reportData?.report;
  const evaluation = evaluationData?.evaluation;

  const scores = report?.scores || evaluation?.scores || {};
  const findings = report?.findings || evaluation?.findings || [];

  const globalScore = report?.global_score || evaluation?.global_score || 0;
  const qualityLevel = report?.quality_level || evaluation?.quality_level || "Pendiente";

  const severities = {
    criticas: findings.filter((f) => f.severity === "Crítica").length,
    altas: findings.filter((f) => f.severity === "Alta").length,
    medias: findings.filter((f) => f.severity === "Media").length,
    bajas: findings.filter((f) => f.severity === "Baja").length,
  };

  const scoreItems = [
    { label: "Adecuación Funcional", value: scores.adecuacion_funcional || 0 },
    { label: "Eficiencia de Desempeño", value: scores.eficiencia_desempeno || scores.eficiencia || 0 },
    { label: "Usabilidad", value: scores.usabilidad || 0 },
    { label: "Mantenibilidad", value: scores.mantenibilidad || 0 },
    { label: "Accesibilidad", value: scores.accesibilidad || 0 },
  ];

  const downloadPDF = async () => {
    const element = reportRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save("FrontMind-Reporte-ISO-25010.pdf");
  };

  return (
    <div className="layout">
      <Sidebar activeStep={5} />

      <main className="report-main">
        <section className="report-export" ref={reportRef}>
          <header className="pdf-header">
            <div>
              <h1>FrontMind AI</h1>
              <p>Evaluación de Calidad Frontend</p>
            </div>

            <div className="pdf-title">
              <h2>REPORTE DE EVALUACIÓN</h2>
              <h3>ISO/IEC 25010 - FRONTEND</h3>
            </div>

            <div className="pdf-meta">
              <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
              <p><strong>ID:</strong> FM-{Date.now()}</p>
            </div>
          </header>

          <section className="pdf-grid top-section">
            <div className="pdf-card">
              <h3>INFORMACIÓN GENERAL</h3>
              <p><strong>URL evaluada:</strong></p>
              <p>{inputUrl}</p>
              <p><strong>Tecnología detectada:</strong></p>
              <p>HTML, CSS, JavaScript</p>
              <p><strong>Motor de evaluación:</strong></p>
              <p>FrontMind AI Engine</p>
              <p><strong>Estándar aplicado:</strong></p>
              <p>ISO/IEC 25010</p>
              <p><strong>Alcance:</strong></p>
              <p>Interfaz de Usuario Frontend</p>
            </div>

            <div className="pdf-card summary-card-large">
              <h3>RESUMEN EJECUTIVO</h3>

              <div className="summary-layout">
                <div className="circle-score">
                  <span>{globalScore}</span>
                  <small>/100</small>
                </div>

                <div>
                  <p>
                    La evaluación automática basada en ISO/IEC 25010 indica que
                    la interfaz presenta un nivel de calidad <strong>{qualityLevel}</strong>.
                    Se detectaron hallazgos relacionados con accesibilidad,
                    usabilidad, mantenibilidad y estructura frontend.
                  </p>

                  <div className="incident-boxes">
                    <div><strong>{findings.length}</strong><span>Total</span></div>
                    <div><strong>{severities.criticas}</strong><span>Críticas</span></div>
                    <div><strong>{severities.altas}</strong><span>Altas</span></div>
                    <div><strong>{severities.medias}</strong><span>Medias</span></div>
                    <div><strong>{severities.bajas}</strong><span>Bajas</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pdf-grid middle-section">
            <div className="pdf-card">
              <h3>PUNTAJE POR CARACTERÍSTICAS ISO/IEC 25010</h3>
              <PentagonChart data={scoreItems} />
            </div>

            <div className="pdf-card">
              <h3>DISTRIBUCIÓN DE INCIDENCIAS POR SEVERIDAD</h3>
              <div className="donut-layout">
                <div
                  className="donut"
                  style={{
                    background: `conic-gradient(
                      #dc2626 0 ${severities.criticas * 10}%,
                      #f97316 ${severities.criticas * 10}% ${(severities.criticas + severities.altas) * 10}%,
                      #eab308 ${(severities.criticas + severities.altas) * 10}% ${(severities.criticas + severities.altas + severities.medias) * 10}%,
                      #22c55e 0
                    )`,
                  }}
                >
                  <span>{findings.length}</span>
                  <small>Total</small>
                </div>

                <ul className="legend">
                  <li>Críticas: {severities.criticas}</li>
                  <li>Altas: {severities.altas}</li>
                  <li>Medias: {severities.medias}</li>
                  <li>Bajas: {severities.bajas}</li>
                </ul>
              </div>

              <h3>PUNTAJE POR CARACTERÍSTICA</h3>
              <div className="bars">
                {scoreItems.map((item) => (
                  <div className="bar-row" key={item.label}>
                    <span>{item.label}</span>
                    <div><i style={{ width: `${item.value}%` }}></i></div>
                    <strong>{item.value}/100</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="pdf-card">
            <h3>HALLAZGOS PRINCIPALES</h3>

            <table className="findings-table">
              <thead>
                <tr>
                  <th>Severidad</th>
                  <th>Hallazgo</th>
                  <th>Característica</th>
                  <th>Recomendación</th>
                </tr>
              </thead>

              <tbody>
                {findings.slice(0, 8).map((item, index) => (
                  <tr key={index}>
                    <td>{item.severity}</td>
                    <td>{item.finding}</td>
                    <td>{item.dimension}</td>
                    <td>{item.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="pdf-grid bottom-section">
            <div className="pdf-card">
              <h3>DISTRIBUCIÓN DE INCIDENCIAS POR CARACTERÍSTICA</h3>

              <div className="stack-bars">
                {scoreItems.map((item) => {
                  const count = findings.filter((f) => f.dimension?.includes(item.label.split(" ")[0])).length;
                  return (
                    <div className="stack-row" key={item.label}>
                      <span>{item.label}</span>
                      <div>
                        <i style={{ width: `${Math.min(count * 12, 100)}%` }}></i>
                      </div>
                      <strong>{count}</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pdf-card">
              <h3>RESUMEN POR NIVEL DE CALIDAD</h3>
              <div className="quality-pyramid">
                <div>Excelente</div>
                <div>Alto</div>
                <div>Medio</div>
                <div>Bajo</div>
                <div>Crítico</div>
              </div>
            </div>
          </section>

          <footer className="pdf-footer">
            <p>
              Metodología: Evaluación automática basada en ISO/IEC 25010,
              WCAG 2.1 AA, análisis DOM, mantenibilidad y criterios frontend.
            </p>
            <p>Generado por FrontMind AI Engine v1.0.0</p>
          </footer>
        </section>

        <div className="report-actions">
          <button className="primary-btn" onClick={downloadPDF}>
            Descargar informe técnico PDF
          </button>

          <button className="secondary-btn" onClick={() => navigate("/input")}>
            Nuevo análisis
          </button>
        </div>
      </main>
    </div>
  );
}

function PentagonChart({ data }) {
  const points = data.map((item, index) => {
    const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
    const radius = (item.value / 100) * 90;
    const x = 120 + Math.cos(angle) * radius;
    const y = 120 + Math.sin(angle) * radius;
    return `${x},${y}`;
  }).join(" ");

  const outer = data.map((_, index) => {
    const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
    const x = 120 + Math.cos(angle) * 90;
    const y = 120 + Math.sin(angle) * 90;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="pentagon-wrapper">
      <svg viewBox="0 0 240 260">
        <polygon points={outer} fill="none" stroke="#94a3b8" strokeDasharray="5 4" />
        <polygon points={points} fill="rgba(37, 99, 235, 0.18)" stroke="#2563eb" strokeWidth="3" />

        {data.map((item, index) => {
          const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
          const x = 120 + Math.cos(angle) * 108;
          const y = 120 + Math.sin(angle) * 108;

          return (
            <text key={item.label} x={x} y={y} textAnchor="middle" fontSize="9" fill="#111827">
              {item.label.split(" ")[0]} {item.value}
            </text>
          );
        })}
      </svg>
    </div>
  );
}