import React, { useState } from 'react';
import { ShieldAlert, Save, KeyRound } from 'lucide-react';
import { setSupabaseKey } from '../services/supabase';

export const ConfigScreen: React.FC = () => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      setSupabaseKey(key.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-red-100 max-w-lg w-full overflow-hidden">
        <div className="bg-red-50 p-6 border-b border-red-100 flex items-center space-x-4">
          <div className="bg-red-100 p-3 rounded-full">
            <ShieldAlert className="text-red-600 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-red-800">Configuration Requise</h1>
            <p className="text-red-600 text-sm">Clé API invalide détectée</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-slate-600 text-sm space-y-2">
            <p>
              L'application ne peut pas démarrer car une <strong>Clé Secrète (Secret Key)</strong> a été détectée ou la clé est manquante.
            </p>
            <p>
              Pour des raisons de sécurité, les navigateurs interdisent l'utilisation de la clé secrète. Vous devez utiliser la clé publique <strong>(anon / public)</strong>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Clé Publique Supabase (Anon Key)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Retrouvez cette clé dans votre tableau de bord Supabase : <br/>
                <span className="font-semibold">Project Settings &gt; API &gt; Project API keys &gt; anon / public</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder et Démarrer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};