import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div 
        className="min-h-screen flex flex-col transition-all duration-200 ease-in-out"
        style={{ paddingLeft: isCollapsed ? '72px' : '260px' }}
      >
        {/* Header */}
        <Header />

        {/* Content Outlet */}
        <main className="flex-1 p-layout-margin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
