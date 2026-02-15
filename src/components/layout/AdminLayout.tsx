import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Palette,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Globe,
  BarChart3,
  Blocks,
  FileText,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  children: ReactNode;
  isSuperAdmin?: boolean;
}

const allNavItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, superOnly: false },
  { href: '/admin/users', label: 'Users', icon: Users, superOnly: false },
  { href: '/admin/design-system', label: 'Design System', icon: Palette, superOnly: true },
  { href: '/admin/blocks', label: 'Block Controls', icon: Blocks, superOnly: true },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, superOnly: false },
  { href: '/admin/domains', label: 'Domains', icon: Globe, superOnly: false },
  { href: '/admin/moderation', label: 'Moderation', icon: Shield, superOnly: false },
  { href: '/admin/audit', label: 'Audit Log', icon: FileText, superOnly: true },
  { href: '/admin/settings', label: 'Settings', icon: Settings, superOnly: true },
];

export default function AdminLayout({ children, isSuperAdmin = false }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = allNavItems.filter(item => !item.superOnly || isSuperAdmin);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-panel border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-dark flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">Admin</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 gradient-dark text-white
          transform transition-transform duration-300 ease-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 h-16 px-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              {isSuperAdmin ? (
                <Crown className="w-5 h-5 text-amber-400" />
              ) : (
                <Shield className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <span className="font-display font-bold text-xl">LinkBio</span>
              <Badge className={`ml-2 text-xs ${isSuperAdmin ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-primary/20 text-primary-foreground border-primary/30'}`}>
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-white/20 text-white font-medium' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">
                  {user?.user_metadata?.full_name || 'Admin User'}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                className="flex-1 justify-start text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-red-400 hover:bg-white/10"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 pt-16 lg:pt-0">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
