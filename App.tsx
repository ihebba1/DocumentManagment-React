import React, { useEffect, useState } from 'react';
import { supabase, isConfigured } from './services/supabase';
import { Session } from '@supabase/supabase-js';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DocumentList } from './components/DocumentList';
import { DocumentUpload } from './components/DocumentUpload';
import { ConfigScreen } from './components/ConfigScreen';
import { ViewState } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');

  useEffect(() => {
    // 1. Check if configured first
    if (!isConfigured()) {
      setLoading(false);
      return;
    }

    // 2. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 3. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Block rendering if config is missing
  if (!isConfigured()) {
    return <ConfigScreen />;
  }

  const renderContent = () => {
    if (!session) return null;

    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard userId={session.user.id} />;
      case 'DOCUMENTS':
        return <DocumentList userId={session.user.id} />;
      case 'UPLOAD':
        return <DocumentUpload userId={session.user.id} onSuccess={() => setCurrentView('DOCUMENTS')} />;
      case 'SETTINGS':
        return (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <h2 className="text-xl font-bold text-slate-800">Paramètres</h2>
            <p className="text-slate-500 mt-2">Configuration du profil et de l'entreprise (À venir).</p>
          </div>
        );
      default:
        return <Dashboard userId={session.user.id} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={setCurrentView} 
      onLogout={handleLogout}
      userEmail={session.user.email}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;