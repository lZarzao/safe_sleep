import React, { createContext, useState, useRef, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const Peer = window.SimplePeer;

const SocketContext = createContext();

const ContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    if (!socket) {
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });

    if (socket) {
      socket.on('me', (id) => setMe(id));

      socket.on('callUser', ({ from, name: callerName, signal }) => {
        setCall({ isReceivingCall: true, from, name: callerName, signal });
      });
    }
  }, [socket]);

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
