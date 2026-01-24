import React, { useState } from 'react';
import Sidebar from './Sidebar';

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main className="content">
        {children}
      </main>
    </div>
  );
}

export default Layout;