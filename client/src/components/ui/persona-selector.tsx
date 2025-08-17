import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Baby, Flower, UserCheck } from 'lucide-react';
import { useLocation } from 'wouter';

interface PersonaSelectorProps {
  selectedPersona: string;
  onPersonaChange: (persona: string) => void;
  className?: string;
}

const personas = [
  {
    id: 'senior',
    name: 'Senior Care',
    description: 'Large fonts, simple interface',
    icon: Heart,
    color: 'bg-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    id: 'child',
    name: 'Kid Friendly',
    description: 'Colorful and engaging',
    icon: Baby,
    color: 'bg-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  {
    id: 'anxious',
    name: 'Calm Mode',
    description: 'Soothing and reassuring',
    icon: Flower,
    color: 'bg-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    id: 'caregiver',
    name: 'Caregiver',
    description: 'Professional tools',
    icon: UserCheck,
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600'
  }
];

export default function PersonaSelector({
  selectedPersona,
  onPersonaChange,
  className = ''
}: PersonaSelectorProps) {
  const [, setLocation] = useLocation();

  const handlePersonaSelect = (personaId: string) => {
    onPersonaChange(personaId);
    // Navigate to chat with selected persona
    setLocation(`/chat/${personaId}`);
  };

  return (
    <Card className={`w-full max-w-2xl ${className}`} data-testid="persona-selector">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Choose Your Care Mode</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {personas.map((persona) => {
            const Icon = persona.icon;
            const isSelected = selectedPersona === persona.id;
            
            return (
              <Button
                key={persona.id}
                variant="ghost"
                className={`h-auto p-4 flex flex-col space-y-2 relative ${
                  isSelected ? persona.bgColor : 'hover:bg-muted'
                }`}
                onClick={() => handlePersonaSelect(persona.id)}
                data-testid={`button-persona-${persona.id}`}
              >
                {isSelected && (
                  <Badge className="absolute -top-2 -right-2 px-2 py-1">
                    Active
                  </Badge>
                )}
                <div className={`w-10 h-10 ${persona.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <p className={`font-medium text-sm ${isSelected ? persona.textColor : 'text-foreground'}`}>
                    {persona.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {persona.description}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Each mode provides personalized interactions tailored to different user needs and preferences.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
