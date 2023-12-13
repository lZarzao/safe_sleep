import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider.js';
import PortalLayout from '../layout/PortalLayout.jsx';
import API_URL from '../constants/constants';

const Dashboard = () => {
  const [todo, setTodo] = useState([]);
  const [title, setTitle] = useState('');
  const auth = useAuth();

  useEffect(() => {
    loadTodo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    createTodo();
  };

  const createTodo = async () => {
    try {
      const response = await fetch(`${API_URL}/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({
          title,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        setTodo([json, ...todo]);
      } else {
        // Mostrar error de conexión
      }
    } catch (error) {}
  };

  const loadTodo = async () => {
    try {
      const response = await fetch(`${API_URL}/todo`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });

      if (response.ok) {
        const json = await response.json();
        setTodo(json);
      } else {
        // Mostrar error de conexión
      }
    } catch (error) {}
  };

  return (
    <PortalLayout>
      <h1>Dashboard de {auth.getUser()?.name || ''}</h1>
      <form onSubmit={handleSubmit}>
        <input type='text' placeholder='Nuevo todo...' onChange={(e) => setTitle(e.target.value)} value={title} />
      </form>
      {todo.map((td) => (
        <div key='td._id'>{td.title}</div>
      ))}
    </PortalLayout>
  );
};

export default Dashboard;
