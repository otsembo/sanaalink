import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Heart
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-hero-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm">UH</span>
              </div>
              <span className="text-xl font-bold text-foreground">Ujuzi Hub</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Connecting skilled professionals and talented artisans across Kenya with customers who value quality and authenticity.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Home Maintenance</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Construction</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Automotive</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Property Care</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tech Services</a></li>
            </ul>
          </div>

          {/* Crafts */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Crafts</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Art & Decor</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Fashion & Textiles</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pottery & Ceramics</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Jewelry</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Woodwork</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+254 700 000 000</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>hello@ujuzihub.co.ke</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-primary" />
                <span>www.ujuzihub.co.ke</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>&copy; 2024 Ujuzi Hub. All rights reserved.</span>
            <Separator orientation="vertical" className="h-4" />
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>in Kenya</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;