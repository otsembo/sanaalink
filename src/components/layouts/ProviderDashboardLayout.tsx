import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Store, 
  Calendar, 
  ShoppingCart, 
  Clock, 
  Globe, 
  Star, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProviderDashboardLayoutProps {
  children: React.ReactNode;
  currentTab: string;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'services', label: 'Services & Products', icon: Store },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'availability', label: 'Availability', icon: Clock },
  { id: 'domain', label: 'Domain', icon: Globe },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ProviderDashboardLayout({ 
  children,
  currentTab
}: ProviderDashboardLayoutProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(`/provider/${path}`);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </Button>
          <span className="font-semibold text-lg">Provider Dashboard</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${isMobileMenuOpen ? 'block' : 'hidden'}
          lg:block
          fixed lg:sticky top-0 h-screen w-64 border-r bg-white
        `}>
          <div className="flex flex-col h-full">
            <div className="p-4">
              <h2 className="text-xl font-bold text-kenya-earth hidden lg:block">
                Provider Dashboard
              </h2>
            </div>
            
            <Separator />
            
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentTab === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleNavigation(item.id)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
            
            <Separator />
            
            <div className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
