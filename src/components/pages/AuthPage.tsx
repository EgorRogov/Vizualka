import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, registerUser } from '../../store/slices/authSlice';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error: serverError, isLoading } = useAppSelector((state) => state.auth);

  const fromPage = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs: string[] = [];
    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) errs.push('Неверный формат Email');
    if (password.length < 8) errs.push('Пароль должен быть не менее 8 символов');
    if (!isLogin && password !== confirmPassword) errs.push('Пароли не совпадают');
    if (!isLogin && !name.trim()) errs.push('Имя обязательно для заполнения');

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isLogin) {
      const res = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(res)) navigate(fromPage, { replace: true });
    } else {
      const res = await dispatch(registerUser({ name, email, password }));
      if (registerUser.fulfilled.match(res)) navigate(fromPage, { replace: true });
    }
  };

  return (
    <div style={{ maxWidth: '380px', margin: '80px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>{isLogin ? 'Вход в систему' : 'Регистрация'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!isLogin && (
          <input type="text" placeholder="Имя" value={name} onChange={e => setName(e.target.value)} style={{ padding: '8px' }} />
        )}
        <input type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '8px' }} />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '8px' }} />
        {!isLogin && (
          <input type="password" placeholder="Подтвердите пароль" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ padding: '8px' }} />
        )}
        
        {errors.map((err, i) => <div key={i} style={{ color: 'red', fontSize: '13px' }}>• {err}</div>)}
        {serverError && <div style={{ color: 'darkred', fontWeight: 'bold', fontSize: '13px' }}>{serverError}</div>}

        <button type="submit" disabled={isLoading} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isLoading ? 'Секунду...' : isLogin ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>
      <button onClick={() => { setIsLogin(!isLogin); setErrors([]); }} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
        {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже зарегистрированы? Войти'}
      </button>
    </div>
  );
};