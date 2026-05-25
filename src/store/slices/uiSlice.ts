import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface UiState {
  saveStatus: 'Сохранено' | 'Сохранение...' | 'Ошибка сохранения';
  modals: Record<string, boolean>;
  notifications: Notification[];
}

const initialState: UiState = {
  saveStatus: 'Сохранено',
  modals: {},
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSaveStatus: (state, action: PayloadAction<UiState['saveStatus']>) => {
      state.saveStatus = action.payload;
    },
    
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },

    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Math.random().toString(36).substring(2, 9);
      state.notifications.push({ id, ...action.payload });
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
});

export const { 
  setSaveStatus, 
  openModal, 
  closeModal, 
  addNotification, 
  removeNotification 
} = uiSlice.actions;

export default uiSlice.reducer;