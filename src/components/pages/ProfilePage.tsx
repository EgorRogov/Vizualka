import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import { logout, updateUserProfile } from '@/store/slices/authSlice';
import { fetchDocuments } from '@/store/slices/documentsSlice';
import { changePassword } from '@/store/slices/authSlice';

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);
  const { items: docs, isLoading: isDocsLoading } = useAppSelector((state) => state.documents);

  const [newName, setNewName] = useState(user?.name || '');
  const [isNameLoading, setIsNameLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (user && docs.length === 0) {
      dispatch(fetchDocuments());
    }
  }, [dispatch, user, docs.length]);

  
  const handleChangeName = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!newName.trim() || newName === user?.name) return;
  
  setIsNameLoading(true);
  setNameError(null);
  
  const result = await dispatch(updateUserProfile(newName));
  
  if (updateUserProfile.fulfilled.match(result)) {
    setNameSuccess(true);
    setNewName(result.payload.name); 
    setTimeout(() => setNameSuccess(false), 3000);
  } else {
    setNameError(result.payload as string || 'Ошибка при обновлении имени');
  }
  
  setIsNameLoading(false);
};

  const handleChangePassword = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (newPassword !== confirmPassword) {
    setPasswordError('Пароли не совпадают');
    return;
  }
  if (newPassword.length < 8) {
    setPasswordError('Пароль должен быть минимум 8 символов');
    return;
  }

  setIsPasswordLoading(true);
  setPasswordError(null);
  setPasswordSuccess(false);

  const result = await dispatch(changePassword({ 
    oldPass: currentPassword, 
    newPass: newPassword 
  }));

  setIsPasswordLoading(false);

  if (changePassword.fulfilled.match(result)) {
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => setPasswordSuccess(false), 3000);
  } else {
    setPasswordError(result.payload as string || 'Ошибка при смене пароля');
  }
};

  if (!user) return <div style={{ padding: '20px' }}>Загрузка данных...</div>;

  const handleLogout = () => {
    if (window.confirm('Выйти из аккаунта?')) {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Профиль</h2>
      {user ? (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '15px' }}>
          <p><b>Имя:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>ID:</b> {user.id}</p>
          <button 
            onClick={handleLogout}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              background: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Выйти из системы
          </button>
          <form onSubmit={handleChangeName} style={{ marginBottom: '20px' }}>
        <h3>Изменить имя</h3>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} style={{ padding: '8px', marginRight: '10px' }} />
        <button type="submit" disabled={isNameLoading}>{isNameLoading ? '...' : 'Сохранить'}</button>
        {nameSuccess && <p style={{ color: 'green' }}>Имя обновлено!</p>}
      </form>

       <form onSubmit={handleChangePassword}>
        <h3>Смена пароля</h3>
        <input 
        type="password" 
          placeholder="Текущий пароль" 
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)} 
          style={{ display: 'block', margin: '5px 0', padding: '8px' }} 
          required 
        />
        <input 
          type="password" 
          placeholder="Новый пароль" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)} 
          style={{ display: 'block', margin: '5px 0', padding: '8px' }} 
          required 
        />
        <input 
          type="password" 
          placeholder="Подтверждение" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)} 
          style={{ display: 'block', margin: '5px 0', padding: '8px' }} 
          required 
        />

        {passwordError && <p style={{ color: 'red', fontSize: '14px' }}>{passwordError}</p>}
        {passwordSuccess && <p style={{ color: 'green', fontSize: '14px' }}>Пароль успешно изменен!</p>}

        <button type="submit" disabled={isPasswordLoading}>
          {isPasswordLoading ? 'Загрузка...' : 'Изменить'}
        </button>

      </form>
        </div> 
      ) : (
        <p>Загрузка данных пользователя...</p>
      )}
    </div>
  );
};