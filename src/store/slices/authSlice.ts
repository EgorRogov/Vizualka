import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockApi } from '../../api/mockApi';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await mockApi.login(credentials);
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || 'Ошибка входа');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      return await mockApi.register(userData);
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || 'Ошибка регистрации');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      return await mockApi.refresh();
    } catch (err: unknown) {
      localStorage.removeItem('mock_refresh_token');
      const error = err as Error;
      return rejectWithValue(error.message || 'Сессия истекла');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (newName: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Пользователь не авторизован');
      return await mockApi.updateName(userId, newName);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка при обновлении профиля';
      return rejectWithValue(message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passData: { oldPass: string; newPass: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Пользователь не авторизован');
      return await mockApi.changePassword(userId, passData.oldPass, passData.newPass);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка при смене пароля';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('mock_refresh_token');
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.error = null;
    },

    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) =>{
    builder.addCase(loginUser.pending,(state)=>{
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    });

    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    });

    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(checkAuthStatus.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(checkAuthStatus.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
    });
    
    builder.addCase(checkAuthStatus.rejected, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false; 
    });

    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      if (state.user) {
        state.user.name = action.payload.name;
      }
    });
  },
});

export const { logout, setAuthError } = authSlice.actions;
export default authSlice.reducer;