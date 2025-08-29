import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, Search } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-hero-gradient flex items-center justify-center">
            <span className="text-white font-bold text-sm">UH</span>
          </div>
          <span className="text-xl font-bold text-foreground">Ujuzi Hub</span>
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
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            Login
          </Button>
          <Button variant="hero" size="sm">
            Join as Provider
          </Button>
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
                Services
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
                <Button variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
                <Button variant="hero">
                  Join as Provider
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;