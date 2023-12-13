import { useState } from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import { useAuth } from '../auth/AuthProvider';
import { Navigate, useNavigate } from 'react-router-dom';
import API_URL from '../constants/constants';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorResponse, setErrorResponse] = useState('');

  const auth = useAuth();
  const goTo = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        console.log('Login successful');
        setErrorResponse('');
        const json = await response.json();
        if (json.body.accessToken && json.body.refreshToken) {
          auth.saveUser(json);
          goTo('/dashboard');
        }
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
        <h1>Login</h1>
        {!!errorResponse && <div className='errorMessage'>{errorResponse}</div>}
        <label>Username</label>
        <input type='text' value={username} onChange={(e) => setUsername(e.target.value)} />

        <label>Password</label>
        <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />

        <button>Login</button>
      </form>
    </DefaultLayout>
  );
};

export default Login;
