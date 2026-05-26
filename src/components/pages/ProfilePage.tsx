import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    if (window.confirm('Выйти из аккаунта?')) {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Профиль</h2>
      {user ? (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '15px' }}>
          <p><b>Имя:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>ID:</b> {user.id}</p>
          <button 
            onClick={handleLogout}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              background: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Выйти из системы
          </button>

        </div>
      ) : (
        <p>Загрузка данных пользователя...</p>
      )}
    </div>
  );
};