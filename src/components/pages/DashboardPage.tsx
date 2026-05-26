import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../Dashboard/Dashboard'; 
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createNewDocument, fetchDocuments } from '@/store/slices/documentsSlice';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchDocuments());
    }
  }, [dispatch, isAuthenticated, user]);
  
  const handleOpenDocument = (id: string) => {
    navigate(`/documents/${id}`);
  };

  const handleCreateDocument = async (data: { name: string; rows: number; cols: number }) => {
    const resultAction = await dispatch(createNewDocument(data));
    
    if (createNewDocument.fulfilled.match(resultAction)) {
      const newDoc = resultAction.payload;
      navigate(`/documents/${newDoc.id}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Dashboard 
        onOpenDoc={handleOpenDocument} 
        onCreateDoc={handleCreateDocument} 
      />
    </div>
  );
};