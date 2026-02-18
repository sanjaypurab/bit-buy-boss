import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, LayoutDashboard, ShoppingBag, Menu, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => {
    const cls = mobile ? 'flex flex-col gap-2' : 'flex items-center gap-4';
    return (
      <div className={cls}>
        {user ? (
          <>
            <Link to="/services" onClick={close}>
              <Button variant="ghost" className="gap-2 w-full justify-start">
                <ShoppingBag className="h-4 w-4" />
                Services
              </Button>
            </Link>
            <Link to="/dashboard" onClick={close}>
              <Button variant="ghost" className="gap-2 w-full justify-start">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={close}>
                <Button variant="outline" className="gap-2 w-full justify-start">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
            <Link to="/profile" onClick={close}>
              <Button variant="ghost" className="gap-2 w-full justify-start">
                <User className="h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => { signOut(); close(); }}
              className="gap-2 w-full justify-start"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </>
        ) : (
          <Button onClick={() => { navigate('/auth'); close(); }}>
            Sign In
          </Button>
        )}
      </div>
    );
  };

  return (
    <nav className="border-b bg-card shadow-[var(--shadow-card)]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Shield className="h-6 w-6 text-primary" />
          <span>DigiHub</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex">
          <NavLinks />
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  DigiHub
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
