import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { setBatchValues } from './spreadsheetSlice';
import { setSaveStatus } from './uiSlice';
import { RootState } from '../index'; 

export interface DocumentItem {
  id: string;
  name: string; 
  rows: number;
  cols: number;
  createdAt: string;
  updatedAt: string;
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
  async () => {
    const localDocs = localStorage.getItem('my_documents');
    return localDocs ? (JSON.parse(localDocs) as DocumentItem[]) : [];
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

    dispatch(setDocuments(updatedItems));
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
    builder.addCase(fetchDocuments.fulfilled, (state, action) => {
      state.items = action.payload;
    });
    builder.addCase(fetchDocumentById.fulfilled, (state, action) => {
      state.activeId = action.payload;
    });
  },
});

export const { setDocuments, setActiveDocumentId } = documentsSlice.actions;
export default documentsSlice.reducer;