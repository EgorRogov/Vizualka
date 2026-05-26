import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '3rem', color: '#dc3545' }}>404</h1>
      <h2>Страница не найдена</h2>
      <Link to="/dashboard">Вернуться на Дашборд</Link>
    </div>
  );
};