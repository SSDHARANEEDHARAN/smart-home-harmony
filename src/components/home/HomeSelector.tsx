import { useState } from 'react';
import { Home, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DEFAULT_HOMES = [
  { id: 'home', name: 'Home', icon: '🏠' },
  { id: 'office', name: 'Office', icon: '🏢' },
  { id: 'cabin', name: 'Cabin', icon: '🏡' },
];

interface HomeSelectorProps {
  className?: string;
}

export function HomeSelector({ className }: HomeSelectorProps) {
  const [selectedHome, setSelectedHome] = useState(DEFAULT_HOMES[0]);

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
        {DEFAULT_HOMES.map((home) => (
          <DropdownMenuItem
            key={home.id}
            onClick={() => setSelectedHome(home)}
            className={selectedHome.id === home.id ? 'bg-muted' : ''}
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
