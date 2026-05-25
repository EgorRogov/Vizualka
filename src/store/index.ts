import { configureStore } from '@reduxjs/toolkit';
import spreadsheetReducer from '@/store/slices/spreadsheetSlice';
import uiReducer from '@/store/slices/uiSlice';
import documentsReducer from '@/store/slices/documentsSlice';
import authReducer from '@/store/slices/authSlice';
import { autosaveMiddleware } from '@/store/middleware/autosaveMiddleware';

export const store = configureStore({
  reducer: {
    spreadsheet: spreadsheetReducer,
    ui: uiReducer,
    documents: documentsReducer,
    auth: authReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(autosaveMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;