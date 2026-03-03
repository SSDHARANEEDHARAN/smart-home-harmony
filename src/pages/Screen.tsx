import { Layout } from '@/components/layout/Layout';
import { useDevices } from '@/hooks/useDevices';
import { useHome } from '@/contexts/HomeContext';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { SensorLiveValues } from '@/components/screen/SensorLiveValues';
import { SensorCharts } from '@/components/screen/SensorCharts';
import { CameraFeeds } from '@/components/screen/CameraFeeds';
import { DeviceStatusGrid } from '@/components/screen/DeviceStatusGrid';
import { Monitor } from 'lucide-react';

export default function Screen() {
  const { user } = useAuth();
  const { devices, isLoading } = useDevices();
  const { currentHomeId, currentHome } = useHome();

  if (!user) return <Navigate to="/auth" replace />;

  const homeDevices = devices.filter(d => !d.home_id || d.home_id === currentHomeId);
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
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Screen</h1>
            <p className="text-sm text-muted-foreground">Live monitoring dashboard</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Device Status Grid */}
            <DeviceStatusGrid devices={homeDevices} />

            {/* Sensor Live Values */}
            <SensorLiveValues
              sensorDevices={sensorDevices}
              homeId={currentHomeId}
              firebaseConfig={currentHome?.firebaseConfig}
            />

            {/* Sensor Charts */}
            <SensorCharts sensorDevices={sensorDevices} />

            {/* Camera Feeds */}
            <CameraFeeds cameraDevices={cameraDevices} />
          </div>
        )}
      </div>
    </Layout>
  );
}
