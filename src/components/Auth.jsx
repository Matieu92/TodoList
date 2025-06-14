import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, signupSchema } from '../schemas';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import useTodoStore from '../store';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const setUser = useTodoStore(state => state.setUser);
  const clearStore = useTodoStore(state => state.clearStore);
  const user = useTodoStore(state => state.user);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
  });

  const onSubmit = async (data) => {
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
      }
      reset();
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || 'Wystąpił błąd.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Sign-In error:", err);
      setError(err.message || 'Błąd logowania przez Google.');
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      clearStore();
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err.message || 'Błąd wylogowania.');
    }
  };

  if (user) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
        <p>Zalogowany jako: {user.email}</p>
        <button onClick={handleSignOut}>Wyloguj</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
      <h2>{isLogin ? 'Logowanie' : 'Rejestracja'}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" type="email" {...register('email')} />
          {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password">Hasło:</label>
          <input id="password" type="password" {...register('password')} />
          {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{isLogin ? 'Zaloguj' : 'Zarejestruj'}</button>
      </form>
      <button onClick={() => { setIsLogin(!isLogin); reset(); setError(''); }}>
        {isLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
      </button>
    </div>
  );
};

export default Auth;