import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppAuth } from '@/hooks/useAppAuth';
import { useDevices } from '@/hooks/useDevices';
import { useHome } from '@/contexts/HomeContext';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { Navigate } from 'react-router-dom';

interface TerminalLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'system';
}

export default function Terminal() {
  const { user, loading } = useAppAuth();
  const { devices, isLoading: devicesLoading } = useDevices();
  const { currentHome, currentHomeId } = useHome();
  const { isConnected, hasFirebaseConfig } = useFirebaseSync();
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [commandInput, setCommandInput] = useState('');

  const addLog = (message: string, type: TerminalLog['type'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      message,
      type
    }]);
  };

  // Initialize terminal with system info and current device states
  useEffect(() => {
    if (devicesLoading) return;

    const initLogs: TerminalLog[] = [
      {
        timestamp: new Date().toISOString(),
        message: '═══════════════════════════════════════════════════════════',
        type: 'system'
      },
      {
        timestamp: new Date().toISOString(),
        message: '[SYSTEM] SMART HOME RELAY CONTROL TERMINAL v2.0',
        type: 'system'
      },
      {
        timestamp: new Date().toISOString(),
        message: '═══════════════════════════════════════════════════════════',
        type: 'system'
      },
      {
        timestamp: new Date().toISOString(),
        message: `[INIT] User: ${user?.email}`,
        type: 'info'
      },
      {
        timestamp: new Date().toISOString(),
        message: `[INIT] Workspace: ${currentHome?.name || 'Default'}`,
        type: 'info'
      },
      {
        timestamp: new Date().toISOString(),
        message: `[INIT] Firebase: ${hasFirebaseConfig ? (isConnected ? 'CONNECTED' : 'CONFIGURED (offline)') : 'NOT CONFIGURED'}`,
        type: hasFirebaseConfig && isConnected ? 'success' : 'warning'
      },
    ];

    // Add current device states
    const devicesWithRelays = devices.filter(d => d.relay_pin);
    if (devicesWithRelays.length > 0) {
      initLogs.push({
        timestamp: new Date().toISOString(),
        message: '[INIT] ───────────────── CURRENT DEVICE STATES ─────────────────',
        type: 'system'
      });

      devicesWithRelays.forEach(device => {
        initLogs.push({
          timestamp: new Date().toISOString(),
          message: `[RELAY${device.relay_pin}] ${device.name} → ${device.is_on ? 'ON ●' : 'OFF ○'}`,
          type: device.is_on ? 'success' : 'info'
        });
      });
    }

    initLogs.push({
      timestamp: new Date().toISOString(),
      message: '───────────────────────────────────────────────────────────────',
      type: 'system'
    });
    initLogs.push({
      timestamp: new Date().toISOString(),
      message: '[SYSTEM] Listening for real-time relay events...',
      type: 'info'
    });

    setLogs(initLogs);
  }, [user, currentHome, hasFirebaseConfig, isConnected, devices, devicesLoading]);

  // Subscribe to realtime device changes
  useEffect(() => {
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
          const state = device.is_on ? 'ON ●' : 'OFF ○';
          
          addLog(
            `[RELAY${relayPin || 'N/A'}] ${device.name} → ${state}`,
            device.is_on ? 'success' : 'info'
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Subscribe to relay history for backend logs
  useEffect(() => {
    const channel = supabase
      .channel('terminal-relay-history')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'relay_history',
        },
        (payload) => {
          const entry = payload.new as any;
          const source = entry.source === 'hardware' ? 'ESP32' : 'WEB';
          
          addLog(
            `[BACKEND] Source: ${source} | Relay${entry.relay_pin || 'N/A'} | ${entry.device_name || 'Unknown'} | ${entry.new_state ? 'ON' : 'OFF'}`,
            entry.source === 'hardware' ? 'warning' : 'info'
          );
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

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commandInput.trim()) {
      const cmd = commandInput.trim().toLowerCase();
      
      if (cmd === 'clear') {
        setLogs([{
          timestamp: new Date().toISOString(),
          message: '[SYSTEM] Terminal cleared',
          type: 'system'
        }]);
      } else if (cmd === 'status') {
        addLog('[CMD] Fetching current device status...', 'info');
        devices.filter(d => d.relay_pin).forEach(device => {
          addLog(
            `[RELAY${device.relay_pin}] ${device.name} → ${device.is_on ? 'ON ●' : 'OFF ○'}`,
            device.is_on ? 'success' : 'info'
          );
        });
      } else if (cmd === 'help') {
        addLog('[HELP] Available commands:', 'system');
        addLog('  clear  - Clear terminal output', 'info');
        addLog('  status - Show current device states', 'info');
        addLog('  help   - Show this help message', 'info');
      } else {
        addLog(`[ERROR] Unknown command: ${cmd}`, 'error');
      }
      
      setCommandInput('');
    }
  };

  if (loading || devicesLoading) {
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

  const getLogColor = (type: TerminalLog['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'system': return 'text-cyan-400';
      default: return 'text-green-500/70';
    }
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
        <span className="text-sm">RELAY CONTROL TERMINAL v2.0</span>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
            {isConnected ? '● LIVE' : '○ OFFLINE'}
          </span>
          <span className="text-sm text-green-500/50">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="border border-green-500/30 p-4 h-[calc(100vh-180px)] overflow-y-auto"
      >
        {logs.map((log, index) => (
          <div
            key={index}
            className={`mb-1 ${getLogColor(log.type)}`}
          >
            <span className="text-green-500/50">[{formatTime(log.timestamp)}]</span>{' '}
            {log.message}
          </div>
        ))}
        <div className="animate-pulse">_</div>
      </div>

      {/* Command Input */}
      <div className="border border-green-500/30 mt-2 flex items-center">
        <span className="text-green-400 px-3">$</span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleCommand}
          placeholder="Type 'help' for commands..."
          className="flex-1 bg-transparent border-none outline-none text-green-500 py-2 pr-4 placeholder:text-green-500/30"
        />
      </div>

      {/* Terminal Footer */}
      <div className="border-t border-green-500/30 pt-2 mt-2 text-xs text-green-500/50 flex justify-between">
        <span>Commands: clear, status, help</span>
        <span>Real-time relay monitoring active</span>
      </div>
    </div>
  );
}
