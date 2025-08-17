import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Heart, Menu, MessageCircle, Target, MapPin, Phone, ClipboardList, Pill } from 'lucide-react';

const navigationItems = [
  { name: 'Home', path: '/', icon: Heart },
  { name: 'Chat Assistant', path: '/chat', icon: MessageCircle },
  { name: 'Health Goals', path: '/health-goals', icon: Target },
  { name: 'Find Facilities', path: '/facilities', icon: MapPin },
  { name: 'Medications', path: '/medications', icon: Pill },
  { name: 'Assessment', path: '/assessment', icon: ClipboardList },
  { name: 'Emergency', path: '/emergency', icon: Phone }
];

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location === '/';
    }
    return location.startsWith(path);
  };

  const NavItems = () => (
    <>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(item.path);
        
        return (
          <Link key={item.path} href={item.path}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${isActive ? '' : 'text-gray-700 hover:text-primary'}`}
              onClick={() => setIsOpen(false)}
              data-testid={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer" data-testid="nav-logo">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">InteliMed</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navigationItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`${isActive ? '' : 'text-gray-700 hover:text-primary'}`}
                    data-testid={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Emergency Button */}
          <div className="hidden md:block">
            <Link href="/emergency">
              <Button 
                variant={isActivePath('/emergency') ? "default" : "destructive"}
                size="sm"
                data-testid="nav-emergency-button"
              >
                <Phone className="w-4 h-4 mr-2" />
                Emergency
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="nav-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">InteliMed</span>
                  </div>
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
