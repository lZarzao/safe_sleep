import { useContext } from 'react';
import { useAuth } from '../auth/AuthProvider.js';
import { SocketContext } from '../context/SocketContext';
import PortalLayout from '../layout/PortalLayout.jsx';

const Dashboard = () => {
  const auth = useAuth();
  const { me } = useContext(SocketContext);

  return (
    <PortalLayout>
      <h1>Dashboard de {auth.getUser()?.name || ''}</h1>
      <p>Mi Socket ID: {me}</p>
    </PortalLayout>
  );
};

export default Dashboard;
