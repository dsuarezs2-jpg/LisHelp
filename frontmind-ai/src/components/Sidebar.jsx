import React from 'react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>FrontMind</h2>
      </div>
      <nav className="sidebar-nav">
        <a href="/dashboard" className="nav-item active">
          <span>📊 Dashboard</span>
        </a>
        <a href="/analysis" className="nav-item">
          <span>🔍 Análisis</span>
        </a>
        <a href="/results" className="nav-item">
          <span>📈 Resultados</span>
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
