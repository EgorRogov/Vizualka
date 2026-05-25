import { describe, test, expect } from 'vitest';
import uiReducer, { 
  setSaveStatus, 
  openModal, 
  closeModal, 
  addNotification, 
  UiState 
} from '../uiSlice';

describe('uiSlice reducer', () => {
  const initialState: UiState = {
    saveStatus: 'Сохранено',
    modals: {},
    notifications: [],
  };

  test('должен возвращать дефолтный стейт', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('должен корректно обновлять статус сохранения', () => {
    const state = uiReducer(initialState, setSaveStatus('Сохранение...'));
    expect(state.saveStatus).toBe('Сохранение...');
  });

  test('должен открывать и закрывать модальные окна', () => {
    const openState = uiReducer(initialState, openModal('settings'));
    expect(openState.modals['settings']).toBe(true);

    const closeState = uiReducer(openState, closeModal('settings'));
    expect(closeState.modals['settings']).toBe(false);
  });

  test('должен добавлять уведомление со случайным id', () => {
    const action = addNotification({ message: 'Успешно!', type: 'success' });
    const state = uiReducer(initialState, action);

    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0]!.message).toBe('Успешно!');
    expect(state.notifications[0]!.id).toBeDefined();
  });
});