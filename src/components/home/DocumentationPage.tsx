import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Copy, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { ESP32Icon, RaspberryPiIcon, FirebaseIcon, RainMakerIcon, ThingSpeakIcon, MQTTIcon } from './IoTIcons';
import { cn } from '@/lib/utils';

interface DocumentationPageProps {
  onBack: () => void;
}

type DocSection = 'firebase' | 'thingspeak' | 'rainmaker' | 'esp32' | 'raspberry' | 'mqtt';

const sections = [
  { id: 'firebase' as DocSection, name: 'Firebase Integration', icon: FirebaseIcon },
  { id: 'esp32' as DocSection, name: 'ESP32 Setup', icon: ESP32Icon },
  { id: 'raspberry' as DocSection, name: 'Raspberry Pi', icon: RaspberryPiIcon },
  { id: 'thingspeak' as DocSection, name: 'ThingSpeak Integration', icon: ThingSpeakIcon },
  { id: 'rainmaker' as DocSection, name: 'ESP RainMaker', icon: RainMakerIcon },
  { id: 'mqtt' as DocSection, name: 'MQTT Protocol', icon: MQTTIcon },
];

export function DocumentationPage({ onBack }: DocumentationPageProps) {
  const [activeSection, setActiveSection] = useState<DocSection>('firebase');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative bg-muted/50 rounded-lg p-4 font-mono text-xs overflow-x-auto border border-border/50">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
      <pre className="whitespace-pre-wrap pr-8">{code}</pre>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'firebase':
        return <FirebaseContent CodeBlock={CodeBlock} />;
      case 'esp32':
        return <ESP32Content CodeBlock={CodeBlock} />;
      case 'raspberry':
        return <RaspberryPiContent CodeBlock={CodeBlock} />;
      case 'thingspeak':
        return <ThingSpeakContent CodeBlock={CodeBlock} />;
      case 'rainmaker':
        return <RainMakerContent CodeBlock={CodeBlock} />;
      case 'mqtt':
        return <MQTTContent CodeBlock={CodeBlock} />;
      default:
        return null;
    }
  };

  const currentSection = sections.find(s => s.id === activeSection);
  const CurrentIcon = currentSection?.icon || FirebaseIcon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Documentation</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <nav className="space-y-1 lg:sticky lg:top-24">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                      activeSection === section.id
                        ? "bg-foreground text-background font-medium"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <CurrentIcon className="w-8 h-8" />
                <h2 className="text-2xl font-bold">{currentSection?.name}</h2>
              </div>
              <p className="text-muted-foreground">
                {getDescription(activeSection)}
              </p>
            </div>

            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

function getDescription(section: DocSection): string {
  const descriptions: Record<DocSection, string> = {
    firebase: 'Learn how to connect your ESP32 devices with Firebase Realtime Database for seamless smart home control.',
    esp32: 'Set up your ESP32 microcontroller with our smart home platform for direct device control.',
    raspberry: 'Use Raspberry Pi as your smart home hub with Python and Firebase Admin SDK.',
    thingspeak: 'Integrate ThingSpeak for IoT analytics and data visualization of your smart home sensors.',
    rainmaker: 'Connect with ESP RainMaker for cloud-based device provisioning and management.',
    mqtt: 'Implement MQTT protocol for lightweight, efficient IoT device communication.',
  };
  return descriptions[section];
}

// Firebase Content Component
function FirebaseContent({ CodeBlock }: { CodeBlock: any }) {
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible defaultValue="step1" className="w-full space-y-3">
        <AccordionItem value="step1" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">1. Firebase Project Setup</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">Follow these steps to set up your Firebase project:</p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Go to the <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">Firebase Console <ExternalLink className="w-3 h-3" /></a></li>
              <li>Click "Add project" and follow the setup wizard</li>
              <li>Once created, navigate to "Realtime Database" in the sidebar</li>
              <li>Click "Create Database" and select your preferred location</li>
              <li>Start in "Test mode" for initial development (remember to secure later)</li>
            </ol>
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Database Rules (Development)</p>
              <CodeBlock
                id="firebase-rules"
                code={`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
              />
              <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Warning: These rules are for development only. Secure your database before production.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step2" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">2. Get Firebase Configuration</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Go to Project Settings (gear icon)</li>
              <li>Scroll to "Your apps" section</li>
              <li>Click "Add app" and select Web</li>
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

        <AccordionItem value="step3" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">3. ESP32 Firebase Setup</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">Install the required libraries and configure your ESP32:</p>
            <p className="text-sm font-medium mt-4">Required Libraries</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><a href="https://github.com/mobizt/Firebase-ESP-Client" target="_blank" className="text-primary underline">Firebase ESP32 Client by Mobizt</a></li>
              <li>ArduinoJson by Benoit Blanchon</li>
              <li>WiFi (built-in)</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step4" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">4. Database Structure</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">Recommended data structure for your smart home:</p>
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

        <AccordionItem value="step5" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">5. Web App Integration</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">Add your Firebase config to the Workspace Settings in this app to enable real-time device synchronization.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step6" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">6. Troubleshooting</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Ensure your database URL ends with <code className="bg-muted px-1 rounded">.firebaseio.com</code></li>
              <li>Check that Realtime Database is enabled, not just Firestore</li>
              <li>Verify your API key is correct and has proper permissions</li>
              <li>Check Firebase console for any billing or quota issues</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ESP32 Content Component
function ESP32Content({ CodeBlock }: { CodeBlock: any }) {
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible defaultValue="step1" className="w-full space-y-3">
        <AccordionItem value="step1" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">1. Hardware Requirements</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
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

        <AccordionItem value="step2" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">2. Arduino IDE Setup</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Install Arduino IDE from arduino.cc</li>
              <li>Add ESP32 board URL to Preferences: <code className="bg-muted px-1 rounded text-xs">https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json</code></li>
              <li>Open Boards Manager and install "esp32 by Espressif"</li>
              <li>Select your ESP32 board from Tools → Board menu</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step3" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">3. Required Libraries</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">Install via Arduino Library Manager:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><code className="bg-muted px-1 rounded">Firebase ESP32 Client</code> by Mobizt</li>
              <li><code className="bg-muted px-1 rounded">ArduinoJson</code> by Benoit Blanchon</li>
              <li><code className="bg-muted px-1 rounded">WiFi</code> (built-in)</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step4" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">4. Sample Code</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
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

        <AccordionItem value="step5" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">5. GPIO Pin Reference</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <p className="text-muted-foreground mb-3">Safe GPIO pins for relay control:</p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-sm">
              {[2, 4, 5, 12, 13, 14, 15, 18, 19, 21, 22, 23, 25, 26, 27, 32].map(pin => (
                <div key={pin} className="bg-muted/30 p-2 rounded text-center text-xs">
                  GPIO {pin}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step6" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">6. Multiple Relay Control</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <CodeBlock
              id="esp32-multi-relay"
              code={`#define RELAY1_PIN 26
#define RELAY2_PIN 27
#define RELAY3_PIN 14
#define RELAY4_PIN 12

void checkRelays() {
  if (Firebase.RTDB.getBool(&fbdo, "/relay1")) {
    digitalWrite(RELAY1_PIN, fbdo.boolData());
  }
  if (Firebase.RTDB.getBool(&fbdo, "/relay2")) {
    digitalWrite(RELAY2_PIN, fbdo.boolData());
  }
  // Repeat for other relays...
}`}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step7" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">7. Debugging Tips</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Use Serial Monitor at 115200 baud for debugging</li>
              <li>Check WiFi connection status with <code className="bg-muted px-1 rounded">WiFi.status()</code></li>
              <li>Verify Firebase connection with <code className="bg-muted px-1 rounded">Firebase.ready()</code></li>
              <li>Use LEDs to indicate connection states</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// Raspberry Pi Content Component
function RaspberryPiContent({ CodeBlock }: { CodeBlock: any }) {
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible defaultValue="step1" className="w-full space-y-3">
        <AccordionItem value="step1" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">1. Hardware Setup</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Raspberry Pi 3/4/5 or Zero W</li>
              <li>MicroSD card with Raspberry Pi OS</li>
              <li>Relay HAT or relay module</li>
              <li>Power supply (5V 3A recommended)</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step2" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">2. System Preparation</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
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

        <AccordionItem value="step3" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">3. Firebase Admin SDK</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Go to Firebase Console → Project Settings → Service Accounts</li>
              <li>Click "Generate new private key"</li>
              <li>Save the JSON file as <code className="bg-muted px-1 rounded">serviceAccount.json</code></li>
              <li>Copy to your Raspberry Pi</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step4" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">4. Python Script</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
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
                state = GPIO.HIGH if event.data else GPIO.LOW
                GPIO.output(RELAY_PINS[relay_num], state)
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

        <AccordionItem value="step5" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">5. GPIO Pinout Reference</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-sm">
              {[2, 3, 4, 17, 27, 22, 10, 9, 11, 5, 6, 13, 19, 26, 14, 15].map(pin => (
                <div key={pin} className="bg-muted/30 p-2 rounded text-center text-xs">
                  GPIO {pin}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step6" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">6. Run as System Service</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
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

        <AccordionItem value="step7" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">7. Monitoring & Logs</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <CodeBlock
              id="rpi-logs"
              code={`# View service status
sudo systemctl status smarthome

# View logs
sudo journalctl -u smarthome -f

# Restart service
sudo systemctl restart smarthome`}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ThingSpeak Content Component
function ThingSpeakContent({ CodeBlock }: { CodeBlock: any }) {
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible defaultValue="step1" className="w-full space-y-3">
        <AccordionItem value="step1" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">1. Create ThingSpeak Account</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Go to <a href="https://thingspeak.com" target="_blank" className="text-primary underline">thingspeak.com</a></li>
              <li>Sign up for a free MathWorks account</li>
              <li>Create a new Channel for your smart home data</li>
              <li>Add fields for each sensor (temperature, humidity, etc.)</li>
              <li>Note your Channel ID and Write API Key</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step2" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">2. Channel Configuration</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">Recommended fields for smart home:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Field 1: Temperature (°C)</li>
              <li>Field 2: Humidity (%)</li>
              <li>Field 3: Power Consumption (W)</li>
              <li>Field 4: Device Status (0/1)</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step3" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">3. ESP32 Integration</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <CodeBlock
              id="thingspeak-esp32"
              code={`#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* apiKey = "YOUR_WRITE_API_KEY";

void sendToThingSpeak(float temp, float humidity) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "http://api.thingspeak.com/update?api_key=";
    url += apiKey;
    url += "&field1=" + String(temp);
    url += "&field2=" + String(humidity);
    
    http.begin(url);
    int httpCode = http.GET();
    http.end();
  }
}

void loop() {
  float temp = readTemperature();
  float humidity = readHumidity();
  sendToThingSpeak(temp, humidity);
  delay(15000); // ThingSpeak limit: 15s between updates
}`}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step4" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">4. Read Data from ThingSpeak</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <CodeBlock
              id="thingspeak-read"
              code={`String readFromThingSpeak(int channelId, int fieldNum) {
  HTTPClient http;
  String url = "http://api.thingspeak.com/channels/";
  url += String(channelId);
  url += "/fields/" + String(fieldNum);
  url += "/last.json";
  
  http.begin(url);
  int httpCode = http.GET();
  String payload = http.getString();
  http.end();
  
  return payload;
}`}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step5" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">5. MATLAB Visualizations</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">ThingSpeak includes MATLAB for data analysis:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Create real-time charts and graphs</li>
              <li>Set up email/webhook alerts</li>
              <li>Build custom analytics dashboards</li>
              <li>Export data for further analysis</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step6" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">6. React Integration</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">ThingSpeak React Apps allow you to embed visualizations in this smart home dashboard.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step7" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">7. Rate Limits & Best Practices</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Free tier: 15 second minimum between updates</li>
              <li>8 fields per channel maximum</li>
              <li>Use bulk updates for multiple fields</li>
              <li>Cache data locally for faster display</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ESP RainMaker Content Component
function RainMakerContent({ CodeBlock }: { CodeBlock: any }) {
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible defaultValue="step1" className="w-full space-y-3">
        <AccordionItem value="step1" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">1. What is ESP RainMaker?</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">
              ESP RainMaker is Espressif's end-to-end IoT platform that provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Cloud-based device provisioning</li>
              <li>Mobile app for device control</li>
              <li>Secure communication</li>
              <li>OTA firmware updates</li>
              <li>Alexa & Google Home integration</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step2" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">2. Setup ESP-IDF Environment</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <CodeBlock
              id="rainmaker-setup"
              code={`# Clone ESP-IDF
git clone --recursive https://github.com/espressif/esp-idf.git
cd esp-idf
./install.sh
. ./export.sh

# Clone ESP RainMaker
git clone --recursive https://github.com/espressif/esp-rainmaker.git`}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step3" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">3. Create RainMaker Device</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <CodeBlock
              id="rainmaker-device"
              code={`#include <esp_rmaker_core.h>
#include <esp_rmaker_standard_params.h>

// Create a switch device
esp_rmaker_device_t *switch_device = esp_rmaker_switch_device_create(
    "Smart Switch",
    NULL,  // Optional callback
    false  // Default state
);

// Add to node
esp_rmaker_node_add_device(node, switch_device);`}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step4" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">4. Device Provisioning</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Download ESP RainMaker app (iOS/Android)</li>
              <li>Power on your ESP32 device</li>
              <li>Scan QR code or use BLE for provisioning</li>
              <li>Device appears in your RainMaker dashboard</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step5" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">5. Custom Parameters</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <CodeBlock
              id="rainmaker-params"
              code={`// Add custom parameters
esp_rmaker_param_t *brightness = esp_rmaker_param_create(
    "Brightness",
    ESP_RMAKER_PARAM_TYPE,
    esp_rmaker_int(100),
    PROP_FLAG_READ | PROP_FLAG_WRITE
);

esp_rmaker_param_add_bounds(brightness, 
    esp_rmaker_int(0), 
    esp_rmaker_int(100), 
    esp_rmaker_int(1)
);

esp_rmaker_device_add_param(device, brightness);`}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step6" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">6. Voice Assistant Integration</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">Link your RainMaker account to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Amazon Alexa via Alexa app skills</li>
              <li>Google Home via Google Home app</li>
              <li>Control devices with voice commands</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step7" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">7. REST API Access</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">Access your devices programmatically via RainMaker REST APIs for integration with this dashboard.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// MQTT Content Component
function MQTTContent({ CodeBlock }: { CodeBlock: any }) {
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible defaultValue="step1" className="w-full space-y-3">
        <AccordionItem value="step1" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">1. Understanding MQTT</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">
              MQTT (Message Queuing Telemetry Transport) is a lightweight publish/subscribe protocol ideal for IoT:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Low bandwidth usage</li>
              <li>Reliable message delivery (QoS levels)</li>
              <li>Supports offline/reconnection scenarios</li>
              <li>Perfect for constrained devices</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step2" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">2. Choose an MQTT Broker</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>HiveMQ Cloud</strong> - Free tier available, cloud-hosted</li>
              <li><strong>Mosquitto</strong> - Self-hosted, open source</li>
              <li><strong>EMQX</strong> - Enterprise-grade, scalable</li>
              <li><strong>AWS IoT Core</strong> - Managed service with AWS integration</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step3" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">3. ESP32 MQTT Client</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <CodeBlock
              id="mqtt-esp32"
              code={`#include <WiFi.h>
#include <PubSubClient.h>

const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  if (String(topic) == "home/relay1") {
    digitalWrite(RELAY_PIN, message == "ON" ? HIGH : LOW);
  }
}

void setup() {
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32Client")) {
      client.subscribe("home/relay1");
      client.subscribe("home/relay2");
    }
    delay(5000);
  }
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();
}`}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step4" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">4. Topic Structure</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">Recommended topic hierarchy:</p>
            <CodeBlock
              id="mqtt-topics"
              code={`home/living-room/light/status    # Device status
home/living-room/light/set       # Control commands
home/bedroom/fan/speed           # Fan speed
home/sensors/temperature         # Sensor data
home/+/+/status                  # Wildcard subscription`}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step5" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">5. QoS Levels</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>QoS 0</strong> - At most once (fire & forget)</li>
              <li><strong>QoS 1</strong> - At least once (acknowledged)</li>
              <li><strong>QoS 2</strong> - Exactly once (highest reliability)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">Use QoS 1 for device control, QoS 0 for sensor data.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step6" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">6. Secure MQTT (TLS)</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <CodeBlock
              id="mqtt-tls"
              code={`#include <WiFiClientSecure.h>

WiFiClientSecure secureClient;
PubSubClient client(secureClient);

void setup() {
  secureClient.setCACert(root_ca);
  client.setServer(mqtt_server, 8883);
}`}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step7" className="border border-border/50 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="font-medium">7. Web Dashboard Integration</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <p className="text-muted-foreground">Connect this dashboard to MQTT using MQTT over WebSocket for real-time updates without page refresh.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
