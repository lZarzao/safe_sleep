import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.js';
import { SocketContext } from '../context/SocketContext.js';
import API_URL from '../constants/constants.js';
import logoName from '../assets/logoName.png';
import ModalStation from '../components/ModalStation.jsx'

export const BabyStationLayout = ({ children }) => {
  const auth = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { connectSocket, disconnectSocket, stream } = useContext(SocketContext);

  useEffect(() => {
    // Establecer la conexión de Socket.IO cuando el componente se monta
    connectSocket();

    // Desconectar Socket.IO cuando el componente se desmonta
    return () => {
      disconnectSocket();
    };
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

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
              <button onClick={toggleModal} className="button-logo">
                <img src={logoName} alt='Logo' className='navbar-logo' />
              </button>
            </li>
            <li>
              <button onClick={handleSignOut}>Sign Out</button>
            </li>
          </ul>
        </nav>
      </header>
      <ModalStation isOpen={isModalOpen} toggleModal={toggleModal} />
      <main className='dashboard-Station'>{children}</main>
    </>
  );
};
