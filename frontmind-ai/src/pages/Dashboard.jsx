import Sidebar from '../components/Sidebar';
import './pages.css';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main-content">
        <h1>Dashboard - FrontMind AI</h1>
        <p>Bienvenido a FrontMind AI</p>
        <p>Sistema de análisis inteligente de interfaces de usuario</p>
      </main>
    </div>
  );
}
