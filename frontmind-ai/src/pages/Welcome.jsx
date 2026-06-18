export default function Welcome() {
  return (
    <div className="welcome">
      <div className="welcome-container">
        <h1>FrontMind AI</h1>
        <p>Sistema Inteligente de Análisis de Interfaces</p>
        <button onClick={() => window.location.href = '/dashboard'}
          className="btn-primary"
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}
