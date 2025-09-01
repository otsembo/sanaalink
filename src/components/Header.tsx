import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProviderStatus } from '@/hooks/use-provider-status';
import { Menu, User, ShoppingCart, LogOut, Settings, MessageCircle, Package, Search, Plus } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isProvider } = useProviderStatus(user?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-hero-gradient flex items-center justify-center">
            <span className="text-white font-bold text-sm">UH</span>
          </div>
          <span className="text-xl font-bold text-foreground">Sanaa Link</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#services" className="text-foreground hover:text-primary transition-colors font-medium">
            Services
          </a>
          <a href="#crafts" className="text-foreground hover:text-primary transition-colors font-medium">
            Crafts
          </a>
          <a href="#domains" className="text-foreground hover:text-primary transition-colors font-medium">
            Domains
          </a>
          <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
            About
          </a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate('/register-provider')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Become Provider
              </Button>
              
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  0
                </Badge>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user.user_metadata?.name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Package className="h-4 w-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  {isProvider && (
                    <DropdownMenuItem onClick={() => navigate('/provider/dashboard')}>
                      <Package className="h-4 w-4 mr-2" />
                      Provider Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate('/register-provider')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Become Provider
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button variant="accent" size="sm" onClick={() => navigate('/auth')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4 mt-6">
              <a 
                href="#services" 
                className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Services"Implement the complete category system with these service categories:
Home Maintenance, Construction, Specialized Trades, Automotive, Property Care, Home Improvement, Beauty Services, Wellness Services, Fitness Services, Entertainment, Photography/Video, Event Services, Performance Arts, Moving Services, Courier Services, Driver Services, Electronic Repair
And these craft categories:
Art & Decor, Fashion & Textiles, Pottery & Ceramics, Woodwork, Jewelry, Home Products, Musical Instruments, Stone Carving, Fiber Arts, Cultural Items, Craft Supplies, Fine Art, Leather Goods
Create category filters on the main page and ensure providers can select multiple categories during registration."

              </a>
              <a 
                href="#crafts" 
                className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Crafts
              </a>
              <a 
                href="#domains" 
                className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Domains
              </a>
              <a 
                href="#about" 
                className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </a>
              <div className="flex flex-col space-y-2 mt-6">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.user_metadata?.name || user.email}</span>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/orders')}>
                      <Package className="h-4 w-4 mr-2" />
                      My Orders
                    </Button>
                    {isProvider && (
                      <Button variant="outline" onClick={() => navigate('/provider/dashboard')}>
                        <Package className="h-4 w-4 mr-2" />
                        Provider Dashboard
                      </Button>
                    )}
                    <Button variant="destructive" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => navigate('/auth')}>
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                    <Button variant="hero" onClick={() => navigate('/register-provider')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Become Provider
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;