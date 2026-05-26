import React from 'react';
import { useAppSelector } from '@/store/hooks';

export const ProfilePage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Профиль</h2>
      {user ? (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '15px' }}>
          <p><b>Имя:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>ID:</b> {user.id}</p>
        </div>
      ) : (
        <p>Загрузка данных пользователя...</p>
      )}
    </div>
  );
};