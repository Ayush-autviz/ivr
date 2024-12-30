import { useEffect, useRef, useState } from 'react';
import { WS_URL, POLYGON_API_KEY } from '../config/polygon';
import type { StockData } from '../types';

export function usePolygonWebSocket(symbol: string) {
  const [data, setData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbol) return;

    // Clear previous data when symbol changes
    setData([]);
    setError(null);

    // Close existing connection
    if (ws.current) {
      ws.current.close();
    }

    try {
      ws.current = new WebSocket(`${WS_URL}?apiKey=${POLYGON_API_KEY}`);

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            action: 'auth',
            params: POLYGON_API_KEY
          }));

          // Subscribe after successful authentication
          setTimeout(() => {
            ws.current?.send(JSON.stringify({
              action: 'subscribe',
              params: `T.${symbol}`  // Changed from O.${symbol} to T.${symbol} for stock trades
            }));
          }, 1000);
        }
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        // Handle authentication success
        if (message[0]?.ev === 'status' && message[0]?.status === 'auth_success') {
          console.log('Authentication successful');
          return;
        }

        // Handle trade data
        if (message[0]?.ev === 'T') {
          const trade = message[0];
          setData(prev => [...prev, {
            price: trade.p,
            timestamp: trade.t
          }].slice(-100)); // Keep only last 100 data points
        }
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Failed to connect to WebSocket');
      };

      ws.current.onclose = () => {
        console.log('WebSocket connection closed');
      };
    } catch (err) {
      console.error('Error setting up WebSocket:', err);
      setError('Failed to setup WebSocket connection');
    }

    return () => {
      if (ws.current) {
        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            action: 'unsubscribe',
            params: `T.${symbol}`
          }));
        }
        ws.current.close();
      }
    };
  }, [symbol]);

  return { data, error };
}