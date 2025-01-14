import { useState, useEffect } from 'react';
import { createAssignmentWebSocket, createProjectWebSocket } from '../utils/websocket';

export const useWebSocket = (type, id, baseUrl) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    if (!id || !baseUrl) return;

    const wsManager = type === 'assignment' 
      ? createAssignmentWebSocket(id, baseUrl)
      : createProjectWebSocket(id, baseUrl);

    wsManager.onMessage((data) => {
      setData(data);
      setStatus('connected');
    });

    wsManager.onError((error) => {
      setError(error);
      setStatus('error');
    });

    wsManager.onClose(() => {
      setStatus('disconnected');
    });

    wsManager.onOpen(() => {
      setStatus('connected');
      setError(null);
    });

    wsManager.connect();

    return () => {
      wsManager.disconnect();
    };
  }, [type, id, baseUrl]);

  return { data, error, status };
};