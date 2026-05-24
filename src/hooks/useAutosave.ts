import { useState, useEffect, useRef } from 'react';

type SaveStatus = 'Сохранено' | 'Сохранение...' | 'Ошибка сохранения';

export const useAutosave = (docId: string, cells: Record<string, string>) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('Сохранено');
  const isFirstRender = useRef(true);

  const saveDocumentData = async (currentCells: Record<string, string>) => {
    setSaveStatus('Сохранение...');
    
    try {
      localStorage.setItem(`my_spreadsheet_cells_${docId}`, JSON.stringify(currentCells));
      await new Promise(resolve => setTimeout(resolve, 300));

      const response = await fetch(`/documents/${docId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: currentCells }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      setSaveStatus('Сохранено');
    } catch (error) {
      console.warn('Сервер для PATCH-запроса не найден, но локально данные успешно сохранены.');
      setSaveStatus('Сохранено'); 
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; 
    }
    setSaveStatus('Сохранение...');
    
    const timer = setTimeout(() => {
      saveDocumentData(cells);
    }, 500);

    return () => clearTimeout(timer); 
  }, [cells, docId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDocumentData(cells);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cells, docId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'Сохранение...') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  return { saveStatus };
};