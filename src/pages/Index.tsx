import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import SearchAndFilters from '@/components/SearchAndFilters';
import ServicesSection from '@/components/ServicesSection';
import CraftsSection from '@/components/CraftsSection';
import DomainChecker from '@/components/DomainChecker';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <SearchAndFilters />
        <ServicesSection />
        <CraftsSection />
        <DomainChecker />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
