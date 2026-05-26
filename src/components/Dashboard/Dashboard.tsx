import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDocuments, DocumentItem } from '@/store/slices/documentsSlice';

export interface Doc {
    id: string;
    name: string;
    rows: number;
    cols: number;
    createdAt: string;
    updatedAt: string;
}

interface DashboardProps {
  onOpenDoc: (id: string) => void;
  onCreateDoc: (data: { name: string; rows: number; cols: number }) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenDoc, onCreateDoc })=>{
  const dispatch = useAppDispatch();

  const docs = useAppSelector((state) => state.documents.items);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newName, setNewName] = useState('Название таблицы');
  const [newRows, setNewRows] = useState(100);
  const [newCols, setNewCols] = useState(26);

  const createDoc = () => {
    onCreateDoc({
      name: newName,
      rows: newRows,
      cols: newCols
    });
    setIsModalOpen(false);
  };

  const deleteDoc = (id: string) => {
    if (window.confirm('Удалить документ?')) {
      const updated = docs.filter(d => d.id !== id);
      dispatch(setDocuments(updated)); 
      
      const rawDocs = localStorage.getItem('my_documents');
      if (rawDocs) {
        const allDocs: DocumentItem[] = JSON.parse(rawDocs);
        localStorage.setItem('my_documents', JSON.stringify(allDocs.filter(d => d.id !== id)));
      }
      localStorage.removeItem(`my_spreadsheet_cells_${id}`);
    }
  };

  const duplicateDoc = (doc: DocumentItem) => {
    const copyName = `${doc.name} (копия)`;
    const copy: DocumentItem = {
      ...doc,
      id: `doc_${Date.now()}`,
      name: copyName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const rawDocs = localStorage.getItem('my_documents');
    const allDocs: DocumentItem[] = rawDocs ? JSON.parse(rawDocs) : [];
    allDocs.push(copy);
    localStorage.setItem('my_documents', JSON.stringify(allDocs));

    dispatch(setDocuments([...docs, copy]));
    
    const oldData = localStorage.getItem(`my_spreadsheet_cells_${doc.id}`);
    if (oldData) {
      localStorage.setItem(`my_spreadsheet_cells_${copy.id}`, oldData);
    }
  };

  const renameDoc = (id: string, name: string) => {
    const updated = docs.map(d => d.id === id ? {
      ...d,
      name: name,
      updatedAt: new Date().toISOString()
    } : d);
    
    dispatch(setDocuments(updated));

    const rawDocs = localStorage.getItem('my_documents');
    if (rawDocs) {
      const allDocs: DocumentItem[] = JSON.parse(rawDocs);
      const updatedGlobal = allDocs.map(d => d.id === id ? {
        ...d,
        name: name,
        updatedAt: new Date().toISOString()
      } : d);
      localStorage.setItem('my_documents', JSON.stringify(updatedGlobal));
    }
  };
  
  return (
    <div style={{ padding: 20 }}>
      <h1>Мои документы</h1>
      <button onClick={() => setIsModalOpen(true)} style={{ marginBottom: 20, padding: '8px 16px' }}>
        + Создать новый
      </button>

      {isModalOpen && (
        <div style={{ border: '1px solid #ccc', padding: 20, marginBottom: 20, width: 300, background: '#f9f9f9', color: '#000' }}>
          <h3>Создание документа</h3>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Название" style={{ width: '100%', marginBottom: 10, padding: '5px' }} /><br/>
          Строк: <input type="number" value={newRows} onChange={e => setNewRows(Number(e.target.value))} style={{ marginBottom: 10, padding: '5px' }} /><br/>
          Колонок: <input type="number" value={newCols} onChange={e => setNewCols(Number(e.target.value))} style={{ marginBottom: 10, padding: '5px' }} /><br/>
          <button onClick={createDoc} style={{ marginRight: 10, padding: '5px 10px' }}>Сохранить</button>
          <button onClick={() => setIsModalOpen(false)} style={{ padding: '5px 10px' }}>Отмена</button>
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {docs.map(doc => (
          <li key={doc.id} style={{ border: '1px solid #ccc', padding: 15, borderRadius: 8, background: '#fff', color: '#000' }}>
            <input 
              value={doc.name} 
              onChange={(e) => renameDoc(doc.id, e.target.value)} 
              style={{ fontWeight: 'bold', fontSize: '18px', border: 'none', width: '100%', borderBottom: '1px dashed #ccc', marginBottom: 10 }}
            />
            <p style={{ margin: '5px 0', fontSize: '12px', color: 'gray' }}>
              Создан: {new Date(doc.createdAt).toLocaleDateString()} <br/>
              Изменен: {new Date(doc.updatedAt).toLocaleTimeString()}
            </p>
            
            <div style={{ marginTop: 15, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => onOpenDoc(doc.id)} style={{ padding: '5px 10px', cursor: 'pointer' }}>Открыть</button>
              <button onClick={() => duplicateDoc(doc)} style={{ padding: '5px 10px', cursor: 'pointer' }}>Дублировать</button>
              <button onClick={() => deleteDoc(doc.id)} style={{ color: 'red', padding: '5px 10px', cursor: 'pointer' }}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};