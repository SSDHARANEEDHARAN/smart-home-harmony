// Node Server WebSocket real-time connection service

type DeviceStateCallback = (deviceId: string, state: Record<string, any>) => void;
type ConnectionStateCallback = (homeId: string, connected: boolean) => void;

interface NodeServerInstance {
  ws: WebSocket | null;
  connected: boolean;
  homeId: string;
  config: NodeServerConfig;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  reconnectAttempts: number;
  deviceStateListeners: Set<DeviceStateCallback>;
  connectionListeners: Set<ConnectionStateCallback>;
}

export interface NodeServerConfig {
  host: string;
  port: string;
  protocol: string;
  wsUrl?: string;
  apiKey?: string;
}

const instances = new Map<string, NodeServerInstance>();
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;

function getWsUrl(config: NodeServerConfig): string {
  if (config.wsUrl) return config.wsUrl;
  const wsProto = config.protocol === 'https' ? 'wss' : 'ws';
  return `${wsProto}://${config.host}:${config.port}/ws`;
}

function notifyConnectionListeners(instance: NodeServerInstance) {
  instance.connectionListeners.forEach(cb => cb(instance.homeId, instance.connected));
}

function notifyDeviceStateListeners(instance: NodeServerInstance, deviceId: string, state: Record<string, any>) {
  instance.deviceStateListeners.forEach(cb => cb(deviceId, state));
}

function scheduleReconnect(instance: NodeServerInstance) {
  if (instance.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.warn(`[NodeServer] Max reconnect attempts reached for ${instance.homeId}`);
    return;
  }

  const delay = BASE_RECONNECT_DELAY * Math.pow(2, Math.min(instance.reconnectAttempts, 6));
  instance.reconnectTimer = setTimeout(() => {
    instance.reconnectAttempts++;
    connectWebSocket(instance);
  }, delay);
}

function connectWebSocket(instance: NodeServerInstance) {
  // Clean up existing connection
  if (instance.ws) {
    instance.ws.onclose = null;
    instance.ws.onerror = null;
    instance.ws.onmessage = null;
    instance.ws.close();
    instance.ws = null;
  }

  const url = getWsUrl(instance.config);
  console.log(`[NodeServer] Connecting to ${url} for home ${instance.homeId}`);

  try {
    const wsUrl = instance.config.apiKey ? `${url}?apiKey=${encodeURIComponent(instance.config.apiKey)}` : url;
    instance.ws = new WebSocket(wsUrl);
  } catch (err) {
    console.error('[NodeServer] WebSocket creation failed:', err);
    scheduleReconnect(instance);
    return;
  }

  instance.ws.onopen = () => {
    console.log(`[NodeServer] Connected to ${instance.homeId}`);
    instance.connected = true;
    instance.reconnectAttempts = 0;
    notifyConnectionListeners(instance);

    // Request initial state
    instance.ws?.send(JSON.stringify({ type: 'get_state' }));
  };

  instance.ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'device_state':
          // Single device update: { type: 'device_state', deviceId: '...', state: { is_on, brightness, ... } }
          if (message.deviceId && message.state) {
            notifyDeviceStateListeners(instance, message.deviceId, message.state);
          }
          break;

        case 'bulk_state':
          // Bulk update: { type: 'bulk_state', devices: { [deviceId]: { is_on, ... } } }
          if (message.devices) {
            Object.entries(message.devices).forEach(([deviceId, state]) => {
              notifyDeviceStateListeners(instance, deviceId, state as Record<string, any>);
            });
          }
          break;

        case 'relay_change':
          // Relay-level update: { type: 'relay_change', relayPin: 1, state: true, deviceId?: '...' }
          if (message.deviceId) {
            notifyDeviceStateListeners(instance, message.deviceId, { is_on: message.state, relay_pin: message.relayPin });
          }
          break;

        case 'pong':
          // Heartbeat response
          break;

        default:
          console.log('[NodeServer] Unknown message type:', message.type);
      }
    } catch (err) {
      console.error('[NodeServer] Failed to parse message:', err);
    }
  };

  instance.ws.onclose = (event) => {
    console.log(`[NodeServer] Disconnected from ${instance.homeId} (code: ${event.code})`);
    instance.connected = false;
    notifyConnectionListeners(instance);
    scheduleReconnect(instance);
  };

  instance.ws.onerror = (err) => {
    console.error(`[NodeServer] WebSocket error for ${instance.homeId}:`, err);
  };
}

// --- Public API ---

export function initNodeServer(homeId: string, config: NodeServerConfig): void {
  // Tear down existing instance
  destroyNodeServer(homeId);

  const instance: NodeServerInstance = {
    ws: null,
    connected: false,
    homeId,
    config,
    reconnectTimer: null,
    reconnectAttempts: 0,
    deviceStateListeners: new Set(),
    connectionListeners: new Set(),
  };

  instances.set(homeId, instance);
  connectWebSocket(instance);
}

export function destroyNodeServer(homeId: string): void {
  const instance = instances.get(homeId);
  if (!instance) return;

  if (instance.reconnectTimer) clearTimeout(instance.reconnectTimer);
  if (instance.ws) {
    instance.ws.onclose = null;
    instance.ws.close();
  }
  instance.deviceStateListeners.clear();
  instance.connectionListeners.clear();
  instances.delete(homeId);
}

export function isNodeServerConnected(homeId: string): boolean {
  return instances.get(homeId)?.connected ?? false;
}

/** Manually trigger a reconnect attempt */
export function reconnectNodeServer(homeId: string): void {
  const instance = instances.get(homeId);
  if (!instance) return;
  if (instance.reconnectTimer) clearTimeout(instance.reconnectTimer);
  instance.reconnectAttempts = 0;
  connectWebSocket(instance);
}

export function subscribeToNodeServerDeviceState(
  homeId: string,
  callback: DeviceStateCallback
): () => void {
  const instance = instances.get(homeId);
  if (!instance) return () => {};

  instance.deviceStateListeners.add(callback);
  return () => { instance.deviceStateListeners.delete(callback); };
}

export function subscribeToNodeServerConnection(
  homeId: string,
  callback: ConnectionStateCallback
): () => void {
  const instance = instances.get(homeId);
  if (!instance) return () => {};

  instance.connectionListeners.add(callback);
  return () => { instance.connectionListeners.delete(callback); };
}

/** Send a device command to the Node Server via WebSocket */
export function sendDeviceCommand(
  homeId: string,
  deviceId: string,
  command: Record<string, any>
): boolean {
  const instance = instances.get(homeId);
  if (!instance?.ws || instance.ws.readyState !== WebSocket.OPEN) return false;

  instance.ws.send(JSON.stringify({
    type: 'device_command',
    deviceId,
    ...command,
  }));
  return true;
}

/** Send a relay command to the Node Server via WebSocket */
export function sendRelayCommand(
  homeId: string,
  relayPin: number,
  state: boolean
): boolean {
  const instance = instances.get(homeId);
  if (!instance?.ws || instance.ws.readyState !== WebSocket.OPEN) return false;

  instance.ws.send(JSON.stringify({
    type: 'relay_command',
    relayPin,
    state,
  }));
  return true;
}
