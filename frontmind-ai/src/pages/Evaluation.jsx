import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { evaluateHtml, generateReport } from "../services/api";
import "./Evaluation.css";

export default function Evaluation() {
  const navigate = useNavigate();
  const htmlEvaluated = localStorage.getItem("htmlEvaluated") || "";

  const [loading, setLoading] = useState(false);
  const [evaluationData, setEvaluationData] = useState(
    JSON.parse(localStorage.getItem("isoEvaluation") || "null")
  );
  const [error, setError] = useState("");

  useEffect(() => {
    async function runEvaluation() {
      if (!htmlEvaluated || evaluationData) return;

      try {
        setLoading(true);
        const result = await evaluateHtml(htmlEvaluated);
        localStorage.setItem("isoEvaluation", JSON.stringify(result));
        setEvaluationData(result);
      } catch (err) {
        setError(err.message || "No se pudo ejecutar la evaluación ISO.");
      } finally {
        setLoading(false);
      }
    }

    runEvaluation();
  }, [htmlEvaluated, evaluationData]);

  const evaluation = evaluationData?.evaluation;

  const scores = useMemo(() => {
    if (!evaluation?.scores) return [];
    return Object.entries(evaluation.scores).map(([key, value]) => ({
      key,
      label: key
        .replaceAll("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      value,
    }));
  }, [evaluation]);

  const continueReport = async () => {
    const report = await generateReport(evaluation);
    localStorage.setItem("technicalReport", JSON.stringify(report));
    navigate("/report");
  };

  return (
    <div className="layout">
      <Sidebar activeStep={4} />

      <main className="evaluation-main">
        <section className="evaluation-content">
          <div className="page-header">
            <h1>Evaluación ISO/IEC 25010</h1>
            <p>
              Análisis automático de características de calidad frontend según el
              estándar ISO/IEC 25010.
            </p>
          </div>

          {loading && <div className="eval-alert">Ejecutando evaluación ISO...</div>}
          {error && <div className="eval-alert">{error}</div>}

          {evaluation && (
            <>
              <section className="score-grid">
                {scores.map((item) => (
                  <div className="score-card" key={item.key}>
                    <h3>{item.label}</h3>
                    <strong>{item.value}</strong>
                    <span>/100</span>
                    <p>Nivel: {item.value >= 80 ? "Alto" : item.value >= 60 ? "Medio-Alto" : item.value >= 40 ? "Medio" : "Bajo"}</p>
                  </div>
                ))}
              </section>

              <section className="chart-card">
                <div>
                  <h2>Desempeño por dimensión</h2>
                  <div className="bar-list">
                    {scores.map((item) => (
                      <div className="bar-row" key={item.key}>
                        <span>{item.label}</span>
                        <div className="bar-track">
                          <i style={{ width: `${item.value}%` }}></i>
                        </div>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="interpretation">
                  <h3>Interpretación</h3>
                  <p>
                    El gráfico muestra el desempeño del frontend por dimensión de
                    calidad. Los valores permiten identificar áreas críticas y
                    oportunidades de mejora.
                  </p>
                </div>
              </section>

              <section className="findings-card">
                <h2>Hallazgos detectados</h2>

                <table>
                  <thead>
                    <tr>
                      <th>Hallazgo</th>
                      <th>Dimensión</th>
                      <th>Severidad</th>
                      <th>Recomendación</th>
                    </tr>
                  </thead>

                  <tbody>
                    {evaluation.findings?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.finding}</td>
                        <td>{item.dimension}</td>
                        <td>{item.severity}</td>
                        <td>{item.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="recommendation-card">
                <h2>Recomendaciones automáticas generadas por agentes</h2>

                {evaluation.findings?.slice(0, 4).map((item, index) => (
                  <div className="recommendation-item" key={index}>
                    <strong>{item.recommendation}</strong>
                    <span>{item.dimension}</span>
                  </div>
                ))}
              </section>

              <div className="evaluation-actions">
                <button className="secondary-btn" onClick={() => navigate("/html")}>
                  Volver
                </button>

                <button className="secondary-btn">
                  Exportar resultados
                </button>

                <button className="primary-btn" onClick={continueReport}>
                  Continuar al reporte técnico
                </button>
              </div>
            </>
          )}
        </section>

        <aside className="evaluation-side">
          <div className="side-card">
            <h3>Resumen de evaluación</h3>
            <strong>{evaluation?.global_score || 0}/100</strong>
            <p>Nivel de calidad: {evaluation?.quality_level || "Pendiente"}</p>
          </div>

          <div className="side-card">
            <h3>Análisis completados</h3>
            <ul>
              <li>Entrada de análisis</li>
              <li>Captura de interfaz</li>
              <li>HTML real o replicado</li>
              <li>Evaluación ISO/IEC 25010</li>
            </ul>
          </div>

          <div className="side-card">
            <h3>Última ejecución</h3>
            <p>Motor de evaluación: FrontMind AI Engine</p>
            <p>Total hallazgos: {evaluation?.total_findings || 0}</p>
          </div>

          <div className="info-box">
            Los resultados se basan en criterios ISO/IEC 25010 aplicados al
            frontend evaluado.
          </div>
        </aside>
      </main>
    </div>
  );
}