import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Trash2 } from 'lucide-react';
import { Scene } from '@/hooks/useScenes';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface SceneCardProps {
  scene: Scene;
  onActivate: () => void;
  onDelete?: () => void;
}

export function SceneCard({ scene, onActivate, onDelete }: SceneCardProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[scene.icon] || LucideIcons.Zap;

  return (
    <Card className={cn(
      "glass border-border/50 overflow-hidden transition-all duration-300 hover:border-primary/50 group"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <IconComponent className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{scene.name}</h3>
              <p className="text-xs text-muted-foreground">
                {scene.device_states.length} devices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onActivate}
              className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Play className="w-4 h-4 mr-1" />
              Activate
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {scene.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {scene.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
