import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface TerminalLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function Terminal() {
  const { user, loading } = useAuth();
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add initial log
    setLogs([{
      timestamp: new Date().toISOString(),
      message: '[SYSTEM] Terminal connected. Listening for relay events...',
      type: 'info'
    }]);

    // Subscribe to realtime device changes
    const channel = supabase
      .channel('terminal-devices')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'devices',
        },
        (payload) => {
          const device = payload.new as any;
          const relayPin = device.relay_pin;
          const state = device.is_on ? 'ON' : 'OFF';
          
          const newLog: TerminalLog = {
            timestamp: new Date().toISOString(),
            message: `[RELAY${relayPin || 'N/A'}] ${device.name} → ${state}`,
            type: device.is_on ? 'success' : 'info'
          };
          
          setLogs(prev => [...prev, newLog]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex items-center justify-center">
        <span className="animate-pulse">Connecting...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4">
      {/* Terminal Header */}
      <div className="border border-green-500/50 p-2 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-sm">RELAY CONTROL TERMINAL v1.0</span>
        <span className="text-sm text-green-500/50">
          {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="border border-green-500/30 p-4 h-[calc(100vh-140px)] overflow-y-auto"
      >
        {logs.map((log, index) => (
          <div
            key={index}
            className={`mb-1 ${
              log.type === 'success' ? 'text-green-400' :
              log.type === 'error' ? 'text-red-400' :
              'text-green-500/70'
            }`}
          >
            <span className="text-green-500/50">[{formatTime(log.timestamp)}]</span>{' '}
            {log.message}
          </div>
        ))}
        <div className="animate-pulse">_</div>
      </div>

      {/* Terminal Footer */}
      <div className="border-t border-green-500/30 pt-2 mt-2 text-xs text-green-500/50">
        Press Ctrl+C to disconnect • Real-time relay monitoring active
      </div>
    </div>
  );
}
