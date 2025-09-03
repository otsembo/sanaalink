import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Hammer, Palette, Globe, Download } from 'lucide-react'; // Added Download
import heroImage from '../assets/hero-image.jpg'; // Ensure you have an appropriate image

const HeroSection = () => {
  const apkDownloadLink = "https://drive.google.com/uc?export=download&id=1W135b_Oeuz4-lmcOD_mukrIRGlaWvUkP";

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Kenyan artisans and service providers at work" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-8 animate-pulse-glow">
            <Globe className="h-4 w-4 mr-2 text-accent" />
            <span className="text-sm font-medium text-accent-foreground">Empowering Local Talent</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Your{' '}
            <span className="bg-hero-gradient bg-clip-text text-transparent">
              One-Stop Platform
            </span>
            <br />
            for Local Skills & Crafts
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with skilled professionals and talented artisans across Kenya. 
            From home repairs to handmade crafts, plus digital tools to grow your business online.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button variant="hero" size="xl" className="w-full sm:w-auto">
              <Search className="h-5 w-5 mr-2" />
              Find Services & Crafts
            </Button>
            <Button variant="accent" size="xl" className="w-full sm:w-auto">
              <Hammer className="h-5 w-5 mr-2" />
              Join as Provider
            </Button>
            {/* New Download APK Button */}
            <a
              href={apkDownloadLink}
              target="_blank" // Opens the link in a new tab
              rel="noopener noreferrer" // Security best practice for target="_blank"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" size="xl" className="w-full">
                <Download className="h-5 w-5 mr-2" />
                Download our Android App
              </Button>
            </a>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-4 rounded-xl bg-card-gradient shadow-card transition-transform hover:scale-105 cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Hammer className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Skilled Services</h3>
              <p className="text-sm text-muted-foreground text-center">Professional contractors & technicians</p>
            </div>

            <div className="flex flex-col items-center p-4 rounded-xl bg-card-gradient shadow-card transition-transform hover:scale-105 cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                <Palette className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Handmade Crafts</h3>
              <p className="text-sm text-muted-foreground text-center">Authentic Kenyan art & products</p>
            </div>

            <div className="flex flex-col items-center p-4 rounded-xl bg-card-gradient shadow-card transition-transform hover:scale-105 cursor-pointer col-span-2 md:col-span-1">
              <div className="h-12 w-12 rounded-full bg-primary-glow/10 flex items-center justify-center mb-3">
                <Globe className="h-6 w-6 text-primary-glow" />
              </div>
              <h3 className="font-semibold text-foreground">Digital Tools</h3>
              <p className="text-sm text-muted-foreground text-center">.ke domains & website builder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-accent/20 rounded-full animate-float hidden lg:block" />
      <div className="absolute bottom-1/4 right-10 w-16 h-16 bg-primary/20 rounded-full animate-float [animation-delay:1s] hidden lg:block" />
    </section>
  );
};

export default HeroSection;