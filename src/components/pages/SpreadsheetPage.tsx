import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useBlocker, Link} from 'react-router-dom';
import { Spreadsheet } from '../Spreadsheet/Spreadsheet';
import { useAppSelector } from '../../store/hooks';
import { NotFoundPage } from '../pages/NotFoundPage';
import { mockApi } from '../../api/mockApi';
import { DocumentItem } from '../../store/slices/documentsSlice';

export const SpreadsheetPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const saveStatus = useAppSelector((state) => state.ui.saveStatus);

  const [access, setAccess] = useState<'loading' | 'granted' | 'denied'>('loading');
  const [docData, setDocData] = useState<DocumentItem | null>(null);
  
  useEffect(() => {
    const checkAccess = async () => {
      if (!documentId || !user) return;
      
      try {
        await mockApi.verifyDocumentAccess(documentId, user.id);
        
        const allDocs: DocumentItem[] = JSON.parse(localStorage.getItem('my_documents') || '[]');
        const doc = allDocs.find((d) => d.id === documentId || d.name === documentId);
        
        if (doc) {
          setDocData(doc);
          setAccess('granted');
        }else {
          setAccess('denied');
        }
      } catch (error: unknown) {
        const err = error as { status?: number };
        
        if (err.status === 403) {
          navigate('/dashboard', { replace: true });
        } else {
          setAccess('denied');
        }
      }
    };
    checkAccess();
  }, [documentId, user, navigate]);

  const hasUnsavedChanges = saveStatus !== 'Сохранено';
  
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && 
      currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmLeave = window.confirm('У вас есть несохраненные изменения. Точно уйти?');
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  if (access === 'loading') {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Проверка прав доступа...</div>;
  }

  if (access === 'denied' || !docData) {
    return <NotFoundPage />;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #ccc', background: '#f8f9fa' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#007bff' }}>
          Мои документы
        </Link>
        <span style={{ margin: '0 8px', color: '#6c757d' }}>-</span>
        <span style={{ fontWeight: 'bold' }}>{docData.name}</span>
      </div>

      <div style={{ flex: 1 }}>
        <Spreadsheet 
          docId={docData.id}
          onBack={() => navigate('/dashboard')} 
          rows={docData.rows || 100} 
          cols={docData.cols || 26} 
        />
      </div>
    </div>
  );
};