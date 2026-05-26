import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { setBatchValues } from './spreadsheetSlice';
import { setSaveStatus } from './uiSlice';
import { RootState } from '../index'; 
import { mockApi } from '../../api/mockApi';

export interface DocumentItem {
  id: string;
  name: string; 
  rows: number;
  cols: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface DocumentsState {
  items: DocumentItem[];
  activeId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  items: [],
  activeId: null,
  isLoading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const currentUserId = state.auth.user?.id;

      if (!currentUserId) return [];

      return await mockApi.fetchDocuments(currentUserId);
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || 'Не удалось загрузить документы');
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  'documents/fetchById',
  async (id: string, { dispatch }) => {
    const docData = localStorage.getItem(`my_spreadsheet_cells_${id}`);
    const cells = docData ? JSON.parse(docData) : {};
    
    dispatch(setBatchValues(cells));
    return id;
  }
);

export const saveDocument = createAsyncThunk(
  'documents/save',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState; 
    const activeId = state.documents.activeId;
    const cells = state.spreadsheet.cells;

    if (!activeId) return;

    dispatch(setSaveStatus('Сохранение...'));
    await new Promise((resolve) => setTimeout(resolve, 400));

    localStorage.setItem(`my_spreadsheet_cells_${activeId}`, JSON.stringify(cells));

    const rawDocs = localStorage.getItem('my_documents');
    const currentItems: DocumentItem[] = rawDocs ? JSON.parse(rawDocs) : [];
    
    const updatedItems = currentItems.map((doc) =>
      doc.id === activeId ? { ...doc, updatedAt: new Date().toISOString() } : doc
    );
    
    localStorage.setItem('my_documents', JSON.stringify(updatedItems));

    dispatch(fetchDocuments()); 
    dispatch(setSaveStatus('Сохранено'));
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<DocumentItem[]>) => {
      state.items = action.payload;
    },
    setActiveDocumentId: (state, action: PayloadAction<string | null>) => {
      state.activeId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDocuments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDocuments.fulfilled, (state, action) => {
      state.items = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchDocuments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchDocumentById.fulfilled, (state, action) => {
      state.activeId = action.payload;
    });

    builder.addMatcher(
      (action) => action.type === 'documents/create/fulfilled',
      (state, action: PayloadAction<DocumentItem>) => {
        state.items.push(action.payload);
      }
    );
  },
});

export const createNewDocument = createAsyncThunk(
  'documents/create',
  async (docParams: { name: string; rows: number; cols: number }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const currentUserId = state.auth.user?.id;

      if (!currentUserId) throw new Error('Пользователь не авторизован');

      const newDoc: DocumentItem = {
        id: `doc_${Date.now()}`,
        name: docParams.name,
        rows: docParams.rows,
        cols: docParams.cols,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUserId,
      };

      const localDocs = localStorage.getItem('my_documents');
      const currentItems: DocumentItem[] = localDocs ? JSON.parse(localDocs) : [];
      currentItems.push(newDoc);
      localStorage.setItem('my_documents', JSON.stringify(currentItems));

      dispatch(fetchDocuments());
      return newDoc;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || 'Ошибка создания документа');
    }
  }
);

export const { setDocuments, setActiveDocumentId } = documentsSlice.actions;
export default documentsSlice.reducer;