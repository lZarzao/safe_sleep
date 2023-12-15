import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider.js';
import { ModalBS } from '../components/ModalBS.jsx';
import API_URL from '../constants/constants';

const Dashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const isAdmin = auth.getUser()?.isAdmin || false;
  const id = auth.getUser()?.id;
  console.log(auth.getUser());

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBabyStationClick = async () => {
    try {
      const response = await fetch(`${API_URL}/baby/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.body.hasBaby) {
          navigate('/baby-station', { state: { babyData: data.body.baby } });
        } else {
          setIsModalOpen(true); // Abre el modal
        }
      } else {
        console.error('Error checking baby');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleParentStationClick = async () => {
    try {
      const response = await fetch(`${API_URL}/parent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(response.status === 201 ? 'Parent created successfully' : 'Parent already exists');
        navigate('/parent-station', { state: { parentData: data.body.parent } });
      } else {
        console.error('Error creating parent');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAcceptModal = () => {
    // Aquí iría la lógica para manejar la aceptación del modal
    setIsModalOpen(false);
    navigate('/baby-station');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Cierra el modal
    navigate('/dashboard');
  };

  return (
    <main className='dashboard'>
      <h1>Hola {auth.getUser()?.name || ''}</h1>
      <p>Para continuar, por favor selecciona una estación</p>
      <button disabled={!isAdmin} onClick={handleBabyStationClick}>
        Estación de bebé
      </button>
      <button onClick={handleParentStationClick}>Estación de padres</button>
      <p>Obs: La estación de bebé es exclusivo del usuario administrador</p>
      <ModalBS isOpen={isModalOpen} onClose={handleCloseModal} onAccept={handleAcceptModal} parentId={id} />
    </main>
  );
};

export default Dashboard;
