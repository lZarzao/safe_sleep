import { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.js';
import { SocketContext } from '../context/SocketContext.js';
import { BabyStationLayout } from '../layout/BabyStationLayout.jsx';
import API_URL from '../constants/constants';

export const BabyStation = () => {
  const location = useLocation();
  const BabyData = location.state?.babyData;
  const auth = useAuth();
  const accessToken = auth.getAccessToken();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const {
    me,
    setCall,
    myVideo,
    SocketIdUpdated,
    callUser,
    userVideo,
    socket,
    leaveCall,
    callAccepted,
    setCallAccepted,
    callEnded,
    setCallEnded,
    connectionRef,
  } = useContext(SocketContext);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [userIsParent, setUserIsParent] = useState(false);
  const [parentId, setparentId] = useState('');

  const handleSearch = async () => {
    setEmail('');
    try {
      const response = await fetch(`${API_URL}/user/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Se encontró un usuario con el correo: ', email);
        setUser(data.body.user);
        setError('');

        try {
          const response = await fetch(`${API_URL}/parent/${data.body.user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data) {
              console.log(
                'El usuario con correo: ',
                email + ', tiene estación de padre con id: ',
                data.body.parent._id
              );
              setparentId(data.body.parent._id);
              setUserIsParent(true);
            }
          } else {
            console.error('Error fetching parent');
            setUserIsParent(false);
          }
        } catch (error) {
          console.error('Error:', error);
          setUserIsParent(false);
        }
      } else {
        setUser(null);
        setError('User not found');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error fetching user');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          babyId: BabyData._id,
          parentId: parentId,
        }),
      });
      setLoading(false);
      if (response.ok) {
        const data = await response.json();
        console.log('Grupo creado con éxito:', data);
        fetchGroup();
      } else {
        console.error('Error al crear el grupo:', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchGroup = async () => {
    try {
      const response = await fetch(`${API_URL}/group/${BabyData._id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.body.groups.length > 0) {
          console.log('La estación de bebé cuenta con un grupo');
          setGroup(data.body.groups);
        }
      } else {
        console.error('Error fetching group');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    setLoading(false);
    fetchGroup();
  }, []);

  useEffect(() => {
    const saveSocketId = async () => {
      if (me) {
        try {
          const response = await fetch(`${API_URL}/baby/${BabyData._id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ socketId: me }),
          });
          if (response.ok) {
            const data = await response.json();
            console.log(data);
            console.log('Se ha guardado el socketId');
          } else {
            console.error('Error saving SocketId');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };
    saveSocketId();
  }, [me]);

  useEffect(() => {
    if (socket) {
      const handleEndCall = () => {
        if (connectionRef.current) {
          connectionRef.current.destroy();
          connectionRef.current = null;
        }

        if (userVideo.current && userVideo.current.srcObject) {
          userVideo.current.srcObject.getTracks().forEach((track) => track.stop());
          userVideo.current.srcObject = null;
        }

        setCall({});
        setCallAccepted(false);
        setCallEnded(true);
        console.log('Llamada finalizada');
      };

      socket.on('endCall', handleEndCall);

      return () => {
        socket.off('endCall', handleEndCall);
      };
    }
  }, [socket]);

  useEffect(() => {
    const handleParentSocketUpdate = (data) => {
      setGroup((currentGroup) => {
        return currentGroup.map((member) => {
          if (member.parentId._id === data.parent) {
            // Actualizar el estado de conexión del parentId
            return { ...member, parentId: { ...member.parentId, socketId: data.socketId } };
          }
          return member;
        });
      });
    };

    SocketIdUpdated(handleParentSocketUpdate);
  }, [SocketIdUpdated]);

  const handleConnect = (parentSocketId) => {
    callUser(parentSocketId);
  };

  const handleEndCall = (parentSocketId) => {
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }

    if (userVideo.current && userVideo.current.srcObject) {
      userVideo.current.srcObject.getTracks().forEach((track) => track.stop());
      userVideo.current.srcObject = null;
    }

    setCall({});
    setCallAccepted(false);
    setCallEnded(true);
    leaveCall(parentSocketId);
    // Cualquier otra limpieza o actualización de UI
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <BabyStationLayout>
      <h1>Dashboard de {auth.getUser()?.name || ''}</h1>
      <h2>Estamos dentro de Baby Station</h2>
      <p>Mi Socket ID: {me}</p>
      <video playsInline muted ref={myVideo} autoPlay style={{ width: '400px' }} />
      <video playsInline ref={userVideo} autoPlay />
      {group ? (
        <div>
          <p>Padres y tutores</p>
          {/* Mostrar información del grupo */}
          {group.map((member) => (
            <div key={member._id}>
              <p key={member._id}>{member.parentId.parentId.name}</p>
              {member.parentId.socketId ? (
                <div>
                  <button onClick={() => handleConnect(member.parentId.socketId)}>Conectar</button>
                  {callAccepted && !callEnded ? (
                    <button onClick={() => handleEndCall(member.parentId.socketId)}>Hang Up</button>
                  ) : null}
                </div>
              ) : (
                <p>Desconectado</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Buscar padres' />
          <button type='button' onClick={handleSearch}>
            Buscar
          </button>
          {user && (
            <form onSubmit={handleAddMember}>
              <div>
                <p>Nombre: {user.name}</p>
                <p>Username: {user.username}</p>
                <button
                  type='submit'
                  disabled={!userIsParent} // Cambiar según la lógica para determinar si el usuario es un padre
                >
                  Añadir
                </button>
                {!userIsParent && <p>El usuario aún no se ha registrado como estación de padre.</p>}
              </div>
            </form>
          )}

          {error && <p>{error}</p>}
        </div>
      )}
      <video playsInline ref={userVideo} autoPlay />
    </BabyStationLayout>
  );
};
