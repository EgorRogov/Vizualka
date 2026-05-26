import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../Dashboard/Dashboard'; 

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const handleOpenDocument = (id: string) => {
    navigate(`/documents/${id}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Dashboard onOpenDoc={handleOpenDocument} />
    </div>
  );
};