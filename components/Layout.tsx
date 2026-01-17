import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  UploadCloud, 
  Settings, 
  LogOut, 
  Menu,
  ShieldCheck
} from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  userEmail?: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  onChangeView, 
  onLogout, 
  userEmail,
  children 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        onChangeView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-10">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">GED Pro</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Tableau de bord" />
          <NavItem view="DOCUMENTS" icon={FileText} label="Mes Documents" />
          <NavItem view="UPLOAD" icon={UploadCloud} label="Nouveau Document" />
          <NavItem view="SETTINGS" icon={Settings} label="Paramètres" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="mb-4 px-2">
            <p className="text-xs text-slate-400 uppercase font-semibold">Connecté en tant que</p>
            <p className="text-sm text-slate-700 font-medium truncate" title={userEmail}>
              {userEmail || 'Utilisateur'}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-white border-b border-slate-200 z-20 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded">
            <ShieldCheck className="text-white" size={20} />
          </div>
          <span className="font-bold text-slate-800">GED Pro</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          <Menu />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-30 pt-16 px-4">
          <nav className="space-y-2">
             <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Tableau de bord" />
            <NavItem view="DOCUMENTS" icon={FileText} label="Mes Documents" />
            <NavItem view="UPLOAD" icon={UploadCloud} label="Nouveau Document" />
            <NavItem view="SETTINGS" icon={Settings} label="Paramètres" />
            <div className="pt-8 border-t border-slate-100 mt-4">
               <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={20} />
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 mt-14 md:mt-0 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
