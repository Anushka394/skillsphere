import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const useSocket = (token) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    socketRef.current = io("/", { auth: { token }, transports: ["websocket"] });
    return () => { socketRef.current?.disconnect(); };
  }, [token]);

  return socketRef;
};

export default useSocket;
