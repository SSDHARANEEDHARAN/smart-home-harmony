import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useDevices } from '@/hooks/useDevices';
import { useHome } from '@/contexts/HomeContext';
import { useAppAuth } from '@/hooks/useAppAuth';
import { SensorLiveValues } from '@/components/screen/SensorLiveValues';
import { SensorCharts } from '@/components/screen/SensorCharts';
import { CameraFeeds } from '@/components/screen/CameraFeeds';
import { DeviceStatusGrid } from '@/components/screen/DeviceStatusGrid';
import { Monitor } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function Screen() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAppAuth();
  const { devices, isLoading } = useDevices();
  const { currentHomeId, currentHome } = useHome();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        </div>
      </Layout>
    );
  }

  const homeDevices = devices.filter(d => !(d as any).home_id || (d as any).home_id === currentHomeId);
  const sensorDevices = homeDevices.filter(d => d.device_type === 'sensor');
  const cameraDevices = homeDevices.filter(d => d.device_type === 'camera');

  return (
    <Layout>
      <div className="container-responsive py-4 sm:py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground">Screen</h1>
            <p className="text-xs text-muted-foreground">Live monitoring dashboard</p>
          </div>
        </div>

        <div className="space-y-6">
          <DeviceStatusGrid devices={homeDevices} />
          <SensorLiveValues
            sensorDevices={sensorDevices}
            homeId={currentHomeId}
            firebaseConfig={currentHome?.firebaseConfig}
          />
          <SensorCharts sensorDevices={sensorDevices} />
          <CameraFeeds cameraDevices={cameraDevices} />
        </div>
      </div>
    </Layout>
  );
}
