import { useState } from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import { useAuth } from '../auth/AuthProvider';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../constants/constants.js';
import login from '../assets/login.png';
import { FaUser, FaLock, FaEnvelope, FaUserPlus } from 'react-icons/fa';

const Signup = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorResponse, setErrorResponse] = useState('');

  const auth = useAuth();
  const goTo = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          isAdmin,
        }),
      });

      if (response.ok) {
        console.log('User created successfully');
        setErrorResponse('');
        goTo('/');
      } else {
        console.log('Something went wrong');
        const json = await response.json();
        setErrorResponse(json.body.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (auth.isAuthenticated) {
    return <Navigate to='/dashboard' />;
  }

  return (
    <DefaultLayout>
      <form className='form' onSubmit={handleSubmit}>
        <img src={login} alt='Logo' className='logo' />
        <h1>Registro</h1>
        {!!errorResponse && <div className='errorMessage'>{errorResponse}</div>}

        <label className='login-label'>Nombre</label>
        <div className='input-icon-wrapper'>
          <FaUserPlus className='input-icon' />
          <input type='text' value={name} onChange={(e) => setName(e.target.value)} placeholder='Nombre completo' />
        </div>

        <label className='login-label'>Correo electrónico</label>
        <div className='input-icon-wrapper'>
          <FaEnvelope className='input-icon' />
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Correo electrónico'
          />
        </div>

        <label className='login-label'>Nombre de Usuario</label>
        <div className='input-icon-wrapper'>
          <FaUser className='input-icon' />
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder='Nombre de usuario'
          />
        </div>

        <label className='login-label'>Contraseña</label>
        <div className='input-icon-wrapper'>
          <FaLock className='input-icon' />
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Contraseña'
          />
        </div>

        <div className='input-icon-wrapper checkbox-wrapper'>
          <input
            id='admin-checkbox'
            type='checkbox'
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className='checkbox'
          />
          <label htmlFor='admin-checkbox' className='checkbox-label'>
            Administrador
          </label>
        </div>

        <button>Registrarse</button>
        <p className='signup-prompt'>
          Si ya tienes cuenta, ingresa aquí: <Link to='/'>Iniciar sesion</Link>
        </p>
      </form>
    </DefaultLayout>
  );
};

export default Signup;
