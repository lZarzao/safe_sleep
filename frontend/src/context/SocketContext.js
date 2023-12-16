import React, { createContext, useState, useRef, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const Peer = window.SimplePeer;

const SocketContext = createContext();

const ContextProvider = ({ children }) => {
  const initialIsBabyStation = window.location.pathname.includes('/baby-station');

  const [socket, setSocket] = useState(null);
  const [isBabyStation, setIsBabyStation] = useState(initialIsBabyStation);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    const currentPath = window.location.pathname;
    setIsBabyStation(currentPath.includes('/baby-station'));

    if (!socket) {
      return;
    }

    let mediaConstraints = { video: isBabyStation, audio: true };

      navigator.mediaDevices
        .getUserMedia(mediaConstraints)
        .then((currentStream) => {
          setStream(currentStream);
          if (myVideo.current && isBabyStation) {
            myVideo.current.srcObject = currentStream;
          }
        })
        .catch((error) => {
          console.error('Error al obtener el flujo de medios: ', error);
        });

    if (socket) {
      socket.on('me', (id) => setMe(id));

      socket.on('callUser', ({ from, name: callerName, signal }) => {
        setCall({ isReceivingCall: true, from, name: callerName, signal });
      });
    }
  }, [socket, isBabyStation]);

  const toggleMic = async () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
      }
    }
    setIsMicActive(!isMicActive);
  };

  const connectSocket = useCallback(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
  }, []);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
  }, [socket]);

  const SocketIdUpdated = useCallback(
    (callback) => {
      if (socket) {
        socket.on('SocketIdUpdated', (data) => {
          console.log('Datos de Parent actualizados evento por socket:', data);
          // Aquí puedes actualizar el estado o la UI según los datos recibidos
          if (callback) callback(data);
        });
      }
    },
    [socket]
  );

  const answerCall = () => {
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
      }
    }

    peer.signal(call.signal);
    connectionRef.current = peer;

    setCallAccepted(true);
    setCallEnded(false);
  };

  const callUser = (id) => {
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: me, name });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket.once('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
    setCallEnded(false);
  };

  const leaveCall = (id) => {
    if (call.from) {
      id = call.from;
    }
    socket.emit('endCall', { to: id });
    console.log('desde el context ', id);
    // window.location.reload();
  };

  return (
    <SocketContext.Provider
      value={{
        isMicActive,
        toggleMic,
        socket,
        connectionRef,
        SocketIdUpdated,
        connectSocket,
        disconnectSocket,
        call,
        setCall,
        callAccepted,
        setCallAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        setCallEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
