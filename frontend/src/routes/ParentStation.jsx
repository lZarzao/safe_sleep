import { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.js';
import { SocketContext } from '../context/SocketContext.js';
import { BabyStationLayout } from '../layout/BabyStationLayout.jsx';
import API_URL from '../constants/constants.js';

export const ParentStation = () => {
  const location = useLocation();
  const parentDataData = location.state?.parentData;
  const auth = useAuth();
  const {
    me,
    SocketIdUpdated,
    answerCall,
    call,
    callAccepted,
    callEnded,
    toggleMic,
    isMicActive,
    userVideo,
    leaveCall,
    socket,
    connectionRef,
    setCall,
    setCallAccepted,
    setCallEnded,
  } = useContext(SocketContext);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await fetch(`${API_URL}/group/${parentDataData._id}`);
        if (response.ok) {
          const data = await response.json();
          console.log(data.body.groups);
          if (data.body.groups.length > 0) {
            console.log('La estación de padres cuenta con un grupo');
            setGroup(data.body.groups);
          }
        } else {
          console.error('Error fetching group');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    setLoading(false);
    fetchGroup();
  }, [auth]);

  useEffect(() => {
    const saveSocketId = async () => {
      if (me) {
        try {
          const response = await fetch(`${API_URL}/parent/${parentDataData._id}`, {
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
    const handleBabySocketUpdate = (data) => {
      setGroup((currentGroup) => {
        return currentGroup.map((member) => {
          if (member.babyId._id === data.baby) {
            // Actualizar el estado de conexión del parentId
            return { ...member, babyId: { ...member.babyId, socketId: data.socketId } };
          }
          return member;
        });
      });
    };

    SocketIdUpdated(handleBabySocketUpdate);
  }, [SocketIdUpdated]);

  if (loading) {
    return <div>Loading...</div>;
  }

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
    leaveCall();
    // Cualquier otra limpieza o actualización de UI
  };

  return (
    <BabyStationLayout>
      <h1>Dashboard de {auth.getUser()?.name || ''}</h1>
      <h2>Estamos dentro de Parent Station</h2>
      <p>Mi Socket ID: {me}</p>
      <button onClick={toggleMic}>{isMicActive ? 'Desactivar Micrófono' : 'Activar Micrófono'}</button>
      {call.isReceivingCall && !callAccepted && (
        <div>
          <h1>Llamada entrante...</h1>
          <button onClick={answerCall}>Responder</button>
        </div>
      )}
      {callAccepted && !callEnded ? <button onClick={handleEndCall}>Hang Up</button> : null}
      <video playsInline ref={userVideo} autoPlay style={{ width: '300px' }} />
      {group ? (
        <div>
          <p>Estaciones de bebé</p>
          {/* Mostrar información del grupo */}
          {group.map((member) => (
            <div key={member._id}>
              <p>{member.babyId.name}</p>
              {member.babyId.socketId ? (
                <button onClick={() => member.babyId.socketId}>Conectar</button>
              ) : (
                <p>Desconectado</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p>No hay estaciones de bebé disponibles</p>
        </div>
      )}
    </BabyStationLayout>
  );
};
