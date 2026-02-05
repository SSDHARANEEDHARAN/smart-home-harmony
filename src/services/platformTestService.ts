 // Platform connection testing service
 
 export interface TestResult {
   success: boolean;
   message: string;
   latency?: number;
 }
 
 // ThingSpeak connection test
 export async function testThingSpeakConnection(
   channelId: string,
   readApiKey?: string
 ): Promise<TestResult> {
   const startTime = Date.now();
   
   try {
     const url = readApiKey 
       ? `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=1`
       : `https://api.thingspeak.com/channels/${channelId}/feeds.json?results=1`;
     
     const response = await fetch(url);
     const latency = Date.now() - startTime;
     
     if (response.ok) {
       const data = await response.json();
       if (data.channel) {
         return {
           success: true,
           message: `Connected to channel: ${data.channel.name}`,
           latency,
         };
       }
     }
     
     if (response.status === 404) {
       return {
         success: false,
         message: 'Channel not found. Check your Channel ID.',
       };
     }
     
     if (response.status === 401 || response.status === 403) {
       return {
         success: false,
         message: 'Access denied. Check your API key.',
       };
     }
     
     return {
       success: false,
       message: `Connection failed: HTTP ${response.status}`,
     };
   } catch (error: any) {
     return {
       success: false,
       message: `Connection error: ${error.message}`,
     };
   }
 }
 
 // ESP RainMaker connection test (simulated - actual would require OAuth)
 export async function testRainMakerConnection(
   nodeId: string
 ): Promise<TestResult> {
   const startTime = Date.now();
   
   try {
     // RainMaker requires OAuth, so we just validate the node ID format
     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
     
     if (!uuidRegex.test(nodeId)) {
       return {
         success: false,
         message: 'Invalid Node ID format. Expected UUID format.',
       };
     }
     
     const latency = Date.now() - startTime;
     
     return {
       success: true,
       message: 'Node ID format valid. Connection will be verified on first sync.',
       latency,
     };
   } catch (error: any) {
     return {
       success: false,
       message: `Validation error: ${error.message}`,
     };
   }
 }
 
 // MQTT connection test (WebSocket-based validation)
 export async function testMQTTConnection(
   brokerUrl: string,
   topic: string
 ): Promise<TestResult> {
   const startTime = Date.now();
   
   try {
     // Validate URL format
     let url: URL;
     try {
       // Handle various MQTT URL formats
       const normalizedUrl = brokerUrl
         .replace(/^mqtt:\/\//, 'ws://')
         .replace(/^mqtts:\/\//, 'wss://')
         .replace(/^tcp:\/\//, 'ws://');
       
       url = new URL(normalizedUrl);
     } catch {
       return {
         success: false,
         message: 'Invalid broker URL format.',
       };
     }
     
     // Validate topic
     if (!topic || topic.trim() === '') {
       return {
         success: false,
         message: 'Topic is required.',
       };
     }
     
     const latency = Date.now() - startTime;
     
     return {
       success: true,
       message: `Broker URL and topic format valid. Host: ${url.hostname}`,
       latency,
     };
   } catch (error: any) {
     return {
       success: false,
       message: `Validation error: ${error.message}`,
     };
   }
 }
 
 // ESP32 connection test
 export async function testESP32Connection(
   ipAddress: string,
   port?: string
 ): Promise<TestResult> {
   const startTime = Date.now();
   
   try {
     // Validate IP format
     const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
     if (!ipRegex.test(ipAddress)) {
       return {
         success: false,
         message: 'Invalid IP address format.',
       };
     }
     
     // Validate IP octets
     const octets = ipAddress.split('.').map(Number);
     if (octets.some(o => o < 0 || o > 255)) {
       return {
         success: false,
         message: 'Invalid IP address: octets must be 0-255.',
       };
     }
     
     // Validate port if provided
     if (port) {
       const portNum = parseInt(port, 10);
       if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
         return {
           success: false,
           message: 'Invalid port number. Must be 1-65535.',
         };
       }
     }
     
     const latency = Date.now() - startTime;
     
     return {
       success: true,
       message: `Configuration valid. Will connect to ${ipAddress}:${port || '80'}`,
       latency,
     };
   } catch (error: any) {
     return {
       success: false,
       message: `Validation error: ${error.message}`,
     };
   }
 }
 
 // Raspberry Pi connection test
 export async function testRaspberryPiConnection(
   host: string,
   port?: string
 ): Promise<TestResult> {
   const startTime = Date.now();
   
   try {
     // Validate host format (IP or hostname)
     const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
     const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
     
     if (!ipRegex.test(host) && !hostnameRegex.test(host)) {
       return {
         success: false,
         message: 'Invalid host format. Use IP address or hostname.',
       };
     }
     
     // Validate port if provided
     if (port) {
       const portNum = parseInt(port, 10);
       if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
         return {
           success: false,
           message: 'Invalid port number. Must be 1-65535.',
         };
       }
     }
     
     const latency = Date.now() - startTime;
     
     return {
       success: true,
       message: `Configuration valid. Will connect to ${host}:${port || '5000'}`,
       latency,
     };
   } catch (error: any) {
     return {
       success: false,
       message: `Validation error: ${error.message}`,
     };
   }
 }