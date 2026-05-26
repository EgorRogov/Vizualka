import React, { useEffect } from 'react';
import { useParams, useNavigate, useBlocker, Link} from 'react-router-dom';
import { Spreadsheet } from '../Spreadsheet/Spreadsheet';
import { useAppSelector } from '../../store/hooks';
import { NotFoundPage } from '../pages/NotFoundPage';

export const SpreadsheetPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();

  const documents = useAppSelector((state) => state.documents?.items || []);
  const saveStatus = useAppSelector((state) => state.ui.saveStatus);

  const activeDocument = documents.find((doc) => 
    doc.id === documentId || doc.name === documentId
  );

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

  if (!documentId) {
    return <div>Ошибка: ID документа не найден в URL</div>;
  }

  if (!activeDocument) {
    return <NotFoundPage />;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #ccc', background: '#f8f9fa' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#007bff' }}>
          Мои документы
        </Link>
        <span style={{ margin: '0 8px', color: '#6c757d' }}>-</span>
        <span style={{ fontWeight: 'bold' }}>
          {activeDocument.name}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <Spreadsheet 
          docId={activeDocument.id} 
          onBack={() => navigate('/dashboard')} 
          rows={activeDocument.rows || 100} 
          cols={activeDocument.cols || 26} 
        />
      </div>
    </div>
  );
};