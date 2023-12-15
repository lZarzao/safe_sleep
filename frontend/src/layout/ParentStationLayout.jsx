import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.js';
import { SocketContext } from '../context/SocketContext.js';
import API_URL from '../constants/constants.js';

export const PortalLayout = ({ children }) => {
  const auth = useAuth();
  const { connectSocket, disconnectSocket, stream } = useContext(SocketContext);

  useEffect(() => {
    // Establecer la conexión de Socket.IO cuando el componente se monta
    connectSocket();

    // Desconectar Socket.IO cuando el componente se desmonta
    return () => {
      disconnectSocket();
    };
  }, []);

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/signout`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getRefreshToken()}`,
        },
      });
      if (response.ok) {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        disconnectSocket();
        auth.signOut();
      }
    } catch (error) {}
  };
  return (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <Link to='/me'>{auth.getUser()?.username ?? ''}</Link>
            </li>
            <li>
              <button onClick={handleSignOut}>Sign Out</button>
            </li>
          </ul>
        </nav>
      </header>
      <main className='dashboard'>{children}</main>
    </>
  );
};
