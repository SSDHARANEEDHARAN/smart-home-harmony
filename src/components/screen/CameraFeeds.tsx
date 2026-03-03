import { Device } from '@/types/smarthome';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, VideoOff } from 'lucide-react';

interface CameraFeedsProps {
  cameraDevices: Device[];
}

export function CameraFeeds({ cameraDevices }: CameraFeedsProps) {
  if (cameraDevices.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Camera Feeds</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameraDevices.map(device => (
          <Card key={device.id} className="border-border/50 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                {device.name}
                <span className={`h-2 w-2 rounded-full ml-auto ${device.is_on ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {device.api_endpoint && device.is_on ? (
                <div className="aspect-video bg-black relative">
                  <img
                    src={device.api_endpoint}
                    alt={`${device.name} feed`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <VideoOff className="w-8 h-8 mb-2" />
                    <p className="text-sm">Feed unavailable</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted/20 flex flex-col items-center justify-center text-muted-foreground">
                  <VideoOff className="w-8 h-8 mb-2" />
                  <p className="text-sm">
                    {!device.api_endpoint
                      ? 'No stream URL configured'
                      : 'Camera is off'}
                  </p>
                  <p className="text-xs mt-1">Set the API endpoint in Devices to stream</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
