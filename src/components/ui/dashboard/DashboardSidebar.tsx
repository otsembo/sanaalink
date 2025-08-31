import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const links = [
    { path: 'services-products', label: 'Services & Products' },
    { path: 'bookings', label: 'Bookings' },
    { path: 'orders', label: 'Orders' },
    { path: 'reviews', label: 'Reviews' },
    { path: 'profile', label: 'Profile' },
    { path: 'availability', label: 'Availability' },
    { path: 'domain', label: 'Domain Settings' },
  ];

  return (
    <aside className="w-64 border-r min-h-screen p-4 space-y-4">
      <div className="space-y-1">
        {links.map((link) => (
          <Button
            key={link.path}
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link to={link.path}>{link.label}</Link>
          </Button>
        ))}
      </div>
      <Separator />
      <Button
        variant="ghost"
        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </aside>
  );
}
