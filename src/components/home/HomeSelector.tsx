import { Home, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useHome } from '@/contexts/HomeContext';

interface HomeSelectorProps {
  className?: string;
}

export function HomeSelector({ className }: HomeSelectorProps) {
  const { homes, currentHomeId, setCurrentHomeId } = useHome();
  const selectedHome = homes.find(h => h.id === currentHomeId) || homes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <span className="mr-2">{selectedHome.icon}</span>
          {selectedHome.name}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {homes.map((home) => (
          <DropdownMenuItem
            key={home.id}
            onClick={() => setCurrentHomeId(home.id)}
            className={currentHomeId === home.id ? 'bg-muted' : ''}
          >
            <span className="mr-2">{home.icon}</span>
            {home.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus className="w-4 h-4 mr-2" />
          Add Home
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
