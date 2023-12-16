import { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.js';
import { SocketContext } from '../context/SocketContext.js';
import { BabyStationLayout } from '../layout/BabyStationLayout.jsx';
import { API_URL } from '../constants/constants.js';
import babyPhoto from '../assets/babyPhoto.png';

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
    setIsMicActive,
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
        setIsMicActive(false);
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
    setIsMicActive(false);
    leaveCall();
    // Cualquier otra limpieza o actualización de UI
  };

  return (
    <BabyStationLayout>
      <h1>{auth.getUser()?.name || ''}</h1>
      {call.isReceivingCall && !callAccepted && (
        <div>
          <h1>Llamada entrante...</h1>
        </div>
      )}
      <video playsInline ref={userVideo} autoPlay />
      {callAccepted && !callEnded && (
        <button onClick={toggleMic}>{isMicActive ? 'Desactivar Micrófono' : 'Activar Micrófono'}</button>
      )}
      {group ? (
        <section className='parents-section'>
          <h2>Estaciones de bebé</h2>
          {/* Mostrar información del grupo */}
          {group.map((member) => (
            <div key={member._id} className='member-card'>
              <div className='member-photo'>
                <img src={member.parentId.parentId.photoUrl || babyPhoto} alt='Foto del usuario' />
              </div>
              <div className='member-info'>
                <p key={member._id}>{member.babyId.name}</p>
                <p className={member.babyId.socketId ? 'status-connected' : 'status-disconnected'}>
                  {member.parentId.socketId ? 'Conectado' : 'Desconectado'}
                </p>
              </div>

              <div className='member-button'>
                {call.isReceivingCall && !callAccepted && (
                  <button onClick={answerCall} className='connect-button'>
                    Ver Transmisión
                  </button>
                )}
                {callAccepted && !callEnded && (
                  <button onClick={handleEndCall} className='hang-up-button'>
                    Salir
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div>
          <p>No hay estaciones de bebé disponibles</p>
        </div>
      )}
    </BabyStationLayout>
  );
};
