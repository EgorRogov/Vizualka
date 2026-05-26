import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export const AppLayout: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <aside style={{ width: '250px', background: '#f8f9fa', borderRight: '1px solid #e0e0e0', padding: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Таблицы</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link 
            to="/dashboard" 
            style={{ textDecoration: 'none', color: isActive('/dashboard') ? '#007bff' : '#333', fontWeight: isActive('/dashboard') ? 'bold' : 'normal' }}
          >
            Документы
          </Link>
          <Link 
            to="/profile" 
            style={{ textDecoration: 'none', color: isActive('/profile') ? '#007bff' : '#333', fontWeight: isActive('/profile') ? 'bold' : 'normal' }}
          >
            Профиль
          </Link>
        </nav>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: '60px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span><b>{user?.name || 'Гость'}</b></span>
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};