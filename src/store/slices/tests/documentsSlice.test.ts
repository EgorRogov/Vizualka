import { describe, test, expect } from 'vitest';
import documentsReducer, {
  setDocuments,
  setActiveDocumentId,
  fetchDocuments,
  fetchDocumentById,
  DocumentsState,
  DocumentItem
} from '../documentsSlice';

describe('documentsSlice reducer', () => {
  const initialState: DocumentsState = {
    items: [],
    activeId: null,
    isLoading: false,
    error: null,
  };

  const mockDocs: DocumentItem[] = [
    { id: 'doc-1', name: 'Таблица 1', rows: 100, cols: 26, createdAt: '2026', updatedAt: '2026' }
  ];

  test('должен менять список документов через setDocuments', () => {
    const state = documentsReducer(initialState, setDocuments(mockDocs));
    expect(state.items).toEqual(mockDocs);
  });

  test('должен менять активный id через setActiveDocumentId', () => {
    const state = documentsReducer(initialState, setActiveDocumentId('doc-1'));
    expect(state.activeId).toBe('doc-1');
  });

  test('должен сохранять документы при fetchDocuments.fulfilled', () => {
    const action = { type: fetchDocuments.fulfilled.type, payload: mockDocs };
    const state = documentsReducer(initialState, action);
    
    expect(state.items).toEqual(mockDocs);
  });

  test('должен устанавливать activeId при fetchDocumentById.fulfilled', () => {
    const action = { type: fetchDocumentById.fulfilled.type, payload: 'doc-1' };
    const state = documentsReducer(initialState, action);
    
    expect(state.activeId).toBe('doc-1');
  });
});