import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { Device } from '@/types/smarthome';
import { Scene } from './useScenes';

interface UseVoiceControlProps {
  devices: Device[];
  scenes: Scene[];
  onToggleDevice: (deviceId: string, isOn: boolean) => void;
  onActivateScene: (scene: Scene) => void;
}

interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function useVoiceControl({
  devices,
  scenes,
  onToggleDevice,
  onActivateScene,
}: UseVoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionType; webkitSpeechRecognition?: new () => SpeechRecognitionType }).SpeechRecognition || 
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionType }).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognitionConstructor);
      
      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
      }
    }
  }, []);

  const processCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Check for scene activation
    for (const scene of scenes) {
      if (lowerCommand.includes(scene.name.toLowerCase()) || 
          lowerCommand.includes('activate ' + scene.name.toLowerCase())) {
        onActivateScene(scene);
        toast({ title: 'Voice Command', description: `Activating ${scene.name}` });
        return true;
      }
    }

    // Check for device commands
    const turnOnMatch = lowerCommand.match(/turn on (.*)/);
    const turnOffMatch = lowerCommand.match(/turn off (.*)/);
    const switchOnMatch = lowerCommand.match(/switch on (.*)/);
    const switchOffMatch = lowerCommand.match(/switch off (.*)/);

    const isOnCommand = turnOnMatch || switchOnMatch;
    const isOffCommand = turnOffMatch || switchOffMatch;
    const deviceName = (isOnCommand?.[1] || isOffCommand?.[1] || '').trim();

    if (deviceName) {
      const matchedDevice = devices.find(d => 
        d.name.toLowerCase().includes(deviceName) ||
        deviceName.includes(d.name.toLowerCase())
      );

      if (matchedDevice) {
        const newState = !!isOnCommand;
        onToggleDevice(matchedDevice.id, newState);
        toast({ 
          title: 'Voice Command', 
          description: `Turning ${newState ? 'on' : 'off'} ${matchedDevice.name}` 
        });
        return true;
      }
    }

    // Check for "all lights" commands
    if (lowerCommand.includes('all lights on') || lowerCommand.includes('turn on all lights')) {
      devices.filter(d => d.device_type === 'light').forEach(d => onToggleDevice(d.id, true));
      toast({ title: 'Voice Command', description: 'Turning on all lights' });
      return true;
    }

    if (lowerCommand.includes('all lights off') || lowerCommand.includes('turn off all lights')) {
      devices.filter(d => d.device_type === 'light').forEach(d => onToggleDevice(d.id, false));
      toast({ title: 'Voice Command', description: 'Turning off all lights' });
      return true;
    }

    // Check for "everything off" command
    if (lowerCommand.includes('everything off') || lowerCommand.includes('turn off everything')) {
      devices.forEach(d => onToggleDevice(d.id, false));
      toast({ title: 'Voice Command', description: 'Turning off all devices' });
      return true;
    }

    toast({ 
      title: 'Command not recognized', 
      description: `"${command}"`,
      variant: 'destructive'
    });
    return false;
  }, [devices, scenes, onToggleDevice, onActivateScene]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast({ 
        title: 'Voice control not supported', 
        description: 'Your browser does not support speech recognition',
        variant: 'destructive'
      });
      return;
    }

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognitionRef.current.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      processCommand(result);
    };

    recognitionRef.current.onerror = (event) => {
      setIsListening(false);
      if (event.error !== 'no-speech') {
        toast({ 
          title: 'Voice recognition error', 
          description: event.error,
          variant: 'destructive'
        });
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  }, [processCommand]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
  };
}
