import { DocumentItem } from '../store/slices/documentsSlice';

interface MockUser {
  id: string;
  name: string;
  email: string;
  password?: string;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const generateToken = (userId: string, type: 'access' | 'refresh') => 
  `mock_${type}_jwt_token_${userId}_${Date.now()}`;

export const mockApi = {
  register: async (userData: { name: string; email: string; password: string }) => {
    await delay(400);
    const users: MockUser[] = JSON.parse(localStorage.getItem('mock_users') || '[]');
    
    if (users.find((u) => u.email === userData.email)) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
    };

    users.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(users));

    const accessToken = generateToken(newUser.id, 'access');
    localStorage.setItem('mock_refresh_token', generateToken(newUser.id, 'refresh'));

    return { user: { id: newUser.id, email: newUser.email, name: newUser.name }, accessToken };
  },

  login: async (credentials: { email: string; password: string }) => {
    await delay(400);
    const users: MockUser[] = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const user = users.find((u) => u.email === credentials.email && u.password === credentials.password);

    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    const accessToken = generateToken(user.id, 'access');
    localStorage.setItem('mock_refresh_token', generateToken(user.id, 'refresh'));

    return { user: { id: user.id, email: user.email, name: user.name }, accessToken };
  },

  refresh: async () => {
    await delay(200);
    const refreshToken = localStorage.getItem('mock_refresh_token');
    if (!refreshToken) throw new Error('Сессия отсутствует');

    const users: MockUser[] = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const user = users.find((u) => refreshToken.includes(u.id));

    if (!user) throw new Error('Пользователь не найден');

    const accessToken = `mock_access_jwt_token_${user.id}_${Date.now()}`;
    localStorage.setItem('mock_refresh_token', `mock_refresh_jwt_token_${user.id}_${Date.now()}`);

    return { user: { id: user.id, email: user.email, name: user.name }, accessToken };
  },

  fetchDocuments: async (userId: string): Promise<DocumentItem[]> => {
    await delay(300);
    const allDocs: DocumentItem[] = JSON.parse(localStorage.getItem('my_documents') || '[]');
    return allDocs.filter(doc => !doc.userId || doc.userId === userId);
  },

  verifyDocumentAccess: async (documentId: string, userId: string): Promise<boolean> => {
    await delay(200);
    const allDocs: DocumentItem[] = JSON.parse(localStorage.getItem('my_documents') || '[]');
    
    const doc = allDocs.find(d => d.id === documentId || d.name === documentId);
    
    if (!doc) {
      throw { status: 404, message: 'Документ не найден' };
    }
    
    if (doc.userId && doc.userId !== userId) {
      throw { status: 403, message: 'Доступ запрещен (Чужой документ)' };
    }
    return true;
  }
};