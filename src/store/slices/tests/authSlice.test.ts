import { describe, test, expect } from 'vitest';
import authReducer, { loginSuccess, logout, User } from '../authSlice';

describe('authSlice reducer', () => {
  test('должен возвращать начальное состояние с твоим mock-пользователем', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    
    expect(state.user!.id).toBe('my-real-id-123'); 
    expect(state.user!.name).toBe('Егор Рогов');
  });

  test('должен успешно логинить пользователя через loginSuccess', () => {
    const newUser: User = {
      id: 'user-999',
      email: 'test@test.ru',
      name: 'Тестовый Юзер'
    };
    
    const state = authReducer(undefined, loginSuccess(newUser));
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(newUser);
  });

  test('должен сбрасывать пользователя при logout', () => {
    const state = authReducer(undefined, logout());
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});