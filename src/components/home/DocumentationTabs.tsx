import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { ESP32Icon, RaspberryPiIcon, FirebaseIcon, ArduinoIcon } from './IoTIcons';

export function DocumentationTabs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="whitespace-pre-wrap">{code}</pre>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="esp32" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/30">
          <TabsTrigger value="esp32" className="flex items-center gap-2 py-3 data-[state=active]:bg-background">
            <ESP32Icon className="w-5 h-5" />
            <span className="hidden sm:inline">ESP32</span>
          </TabsTrigger>
          <TabsTrigger value="raspberry" className="flex items-center gap-2 py-3 data-[state=active]:bg-background">
            <RaspberryPiIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Raspberry Pi</span>
          </TabsTrigger>
          <TabsTrigger value="firebase" className="flex items-center gap-2 py-3 data-[state=active]:bg-background">
            <FirebaseIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Firebase</span>
          </TabsTrigger>
          <TabsTrigger value="arduino" className="flex items-center gap-2 py-3 data-[state=active]:bg-background">
            <ArduinoIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Arduino</span>
          </TabsTrigger>
        </TabsList>

        {/* ESP32 Documentation */}
        <TabsContent value="esp32" className="mt-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ESP32Icon className="w-8 h-8" />
                ESP32 Integration
              </CardTitle>
              <CardDescription>
                Connect your ESP32 microcontroller to control relays and sensors via Firebase Realtime Database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="hardware">
                  <AccordionTrigger>1. Hardware Requirements</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>ESP32 DevKit v1 or compatible board</li>
                      <li>Relay module (1, 2, 4, or 8 channel)</li>
                      <li>Jumper wires</li>
                      <li>5V power supply (for relay module)</li>
                      <li>USB cable for programming</li>
                    </ul>
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium">Wiring Diagram:</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ESP32 GPIO → Relay IN | ESP32 GND → Relay GND | 5V → Relay VCC
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="libraries">
                  <AccordionTrigger>2. Required Libraries</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-muted-foreground">Install these libraries via Arduino Library Manager:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><code className="bg-muted px-1 rounded">Firebase ESP32 Client</code> by Mobizt</li>
                      <li><code className="bg-muted px-1 rounded">ArduinoJson</code> by Benoit Blanchon</li>
                      <li><code className="bg-muted px-1 rounded">WiFi</code> (built-in)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="code">
                  <AccordionTrigger>3. Sample Code</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <CodeBlock
                      id="esp32-code"
                      code={`#include <WiFi.h>
#include <Firebase_ESP_Client.h>

#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

#define API_KEY "YOUR_FIREBASE_API_KEY"
#define DATABASE_URL "YOUR_DATABASE_URL"
#define USER_EMAIL "YOUR_FIREBASE_EMAIL"
#define USER_PASSWORD "YOUR_FIREBASE_PASSWORD"

#define RELAY_PIN 26

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
  }
  
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (Firebase.ready()) {
    if (Firebase.RTDB.getBool(&fbdo, "/relay1")) {
      digitalWrite(RELAY_PIN, fbdo.boolData() ? HIGH : LOW);
    }
  }
  delay(100);
}`}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pinout">
                  <AccordionTrigger>4. GPIO Pin Reference</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {[2, 4, 5, 12, 13, 14, 15, 18, 19, 21, 22, 23, 25, 26, 27, 32].map(pin => (
                        <div key={pin} className="bg-muted/30 p-2 rounded text-center">
                          GPIO {pin}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Raspberry Pi Documentation */}
        <TabsContent value="raspberry" className="mt-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <RaspberryPiIcon className="w-8 h-8" />
                Raspberry Pi Integration
              </CardTitle>
              <CardDescription>
                Use Raspberry Pi as your smart home hub with Python and Firebase Admin SDK.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="setup">
                  <AccordionTrigger>1. Initial Setup</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-muted-foreground">Prepare your Raspberry Pi:</p>
                    <CodeBlock
                      id="rpi-setup"
                      code={`# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip -y

# Install required packages
pip3 install firebase-admin RPi.GPIO`}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="python-code">
                  <AccordionTrigger>2. Python Script</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <CodeBlock
                      id="rpi-code"
                      code={`import firebase_admin
from firebase_admin import credentials, db
import RPi.GPIO as GPIO
import time

# Initialize GPIO
GPIO.setmode(GPIO.BCM)
RELAY_PINS = {1: 17, 2: 27, 3: 22, 4: 23}

for pin in RELAY_PINS.values():
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, GPIO.LOW)

# Initialize Firebase
cred = credentials.Certificate('serviceAccount.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'YOUR_DATABASE_URL'
})

def listener(event):
    if event.data is not None:
        path = event.path.strip('/')
        if path.startswith('relay'):
            relay_num = int(path.replace('relay', ''))
            if relay_num in RELAY_PINS:
                GPIO.output(RELAY_PINS[relay_num], 
                           GPIO.HIGH if event.data else GPIO.LOW)
                print(f"Relay {relay_num}: {'ON' if event.data else 'OFF'}")

# Listen to changes
ref = db.reference('/')
ref.listen(listener)

print("Listening for relay changes...")
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    GPIO.cleanup()`}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="gpio">
                  <AccordionTrigger>3. GPIO Pinout</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {[2, 3, 4, 17, 27, 22, 10, 9, 11, 5, 6, 13, 19, 26, 14, 15].map(pin => (
                        <div key={pin} className="bg-muted/30 p-2 rounded text-center">
                          GPIO {pin}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="service">
                  <AccordionTrigger>4. Run as Service</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-muted-foreground">Create a systemd service to run on boot:</p>
                    <CodeBlock
                      id="rpi-service"
                      code={`# Create service file
sudo nano /etc/systemd/system/smarthome.service

[Unit]
Description=SmartHome Relay Controller
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/pi/smarthome.py
WorkingDirectory=/home/pi
User=pi
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable smarthome
sudo systemctl start smarthome`}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firebase Documentation */}
        <TabsContent value="firebase" className="mt-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FirebaseIcon className="w-8 h-8" />
                Firebase Integration
              </CardTitle>
              <CardDescription>
                Set up Firebase Realtime Database for seamless device synchronization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="project">
                  <AccordionTrigger>1. Firebase Project Setup</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Go to the <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">Firebase Console <ExternalLink className="w-3 h-3" /></a></li>
                      <li>Click "Add project" and follow the setup wizard</li>
                      <li>Once created, navigate to "Realtime Database" in the sidebar</li>
                      <li>Click "Create Database" and select your preferred location</li>
                      <li>Start in "Test mode" for initial development</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="rules">
                  <AccordionTrigger>2. Database Rules</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-muted-foreground">Set these rules for authenticated access:</p>
                    <CodeBlock
                      id="firebase-rules"
                      code={`{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}`}
                    />
                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        These rules are for development only. Secure your database before production.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="config">
                  <AccordionTrigger>3. Get Configuration</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Go to Project Settings (gear icon)</li>
                      <li>Scroll to "Your apps" section</li>
                      <li>Click "Add app" and select Web (&lt;/&gt;)</li>
                      <li>Register your app and copy the config object</li>
                    </ol>
                    <CodeBlock
                      id="firebase-config"
                      code={`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};`}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="structure">
                  <AccordionTrigger>4. Database Structure</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-muted-foreground">Recommended data structure:</p>
                    <CodeBlock
                      id="firebase-structure"
                      code={`{
  "relay1": false,
  "relay2": true,
  "relay3": false,
  "relay4": true,
  "sensors": {
    "temperature": 24.5,
    "humidity": 65,
    "motion": false
  },
  "lastUpdated": 1704067200000
}`}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Arduino Documentation */}
        <TabsContent value="arduino" className="mt-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ArduinoIcon className="w-8 h-8" />
                Arduino Integration
              </CardTitle>
              <CardDescription>
                Connect Arduino with ESP8266 WiFi module for basic IoT control.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="hardware">
                  <AccordionTrigger>1. Hardware Setup</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Arduino Uno/Mega</li>
                      <li>ESP8266 WiFi Module (ESP-01)</li>
                      <li>Logic Level Converter (3.3V ↔ 5V)</li>
                      <li>Relay module</li>
                    </ul>
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium">Wiring:</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Arduino TX → Level Converter → ESP RX<br/>
                        Arduino RX → Level Converter → ESP TX
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="code">
                  <AccordionTrigger>2. AT Commands</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <CodeBlock
                      id="arduino-at"
                      code={`// Basic AT commands for ESP8266
AT                    // Test connection
AT+RST                // Reset module
AT+CWMODE=1           // Station mode
AT+CWJAP="SSID","PWD" // Connect to WiFi
AT+CIFSR              // Get IP address
AT+CIPMUX=1           // Enable multiple connections
AT+CIPSERVER=1,80     // Start server on port 80`}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="alternative">
                  <AccordionTrigger>3. Better Alternative: ESP32</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                      <p className="text-sm">
                        <strong>Recommendation:</strong> For new projects, we recommend using ESP32 directly instead of Arduino + ESP8266. 
                        ESP32 has built-in WiFi, more GPIO pins, and better library support for Firebase.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
