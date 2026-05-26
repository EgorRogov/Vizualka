import { describe, test, expect, beforeEach } from 'vitest';
import authReducer, { logout, loginUser } from '../authSlice';

describe('authSlice reducer', () => {
  beforeEach(() => {
    global.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    };
  });

  test('должен возвращать начальное состояние (безопасный пустой стейт)', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  test('должен успешно логинить пользователя через loginUser.fulfilled', () => {
    const newUser = {
      id: 'user-999',
      email: 'test@test.ru',
      name: 'Тестовый Юзер'
    };
    
    const mockPayload = {
      user: newUser,
      accessToken: 'mock_access_token_123'
    };
    
    const action = { 
      type: loginUser.fulfilled.type, 
      payload: mockPayload 
    };
    
    const state = authReducer(undefined, action);
    
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(newUser);
    expect(state.accessToken).toBe('mock_access_token_123');
  });

  test('должен сбрасывать пользователя при logout', () => {
    const loggedInState = {
      user: { id: 'user-123', email: 'egor@test.ru', name: 'Егор' },
      accessToken: 'some-token',
      isAuthenticated: true,
      isLoading: false,
      error: null
    };

    const state = authReducer(loggedInState, logout());
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });
});