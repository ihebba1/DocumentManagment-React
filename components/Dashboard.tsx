import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { GEDDocument } from '../types';
import { FileText, CheckCircle, Clock, Archive } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  userId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    validated: 0,
    archived: 0,
    totalAmount: 0
  });

  // Mock data for the chart to ensure visuals work even without lots of data
  const chartData = [
    { name: 'Jan', docs: 4 },
    { name: 'Fév', docs: 3 },
    { name: 'Mar', docs: 8 },
    { name: 'Avr', docs: 6 },
    { name: 'Mai', docs: 1 },
    { name: 'Juin', docs: 5 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('documents')
        .select('*'); // RLS filters this

      if (data) {
        const docs = data as unknown as GEDDocument[];
        const totalAmount = docs.reduce((acc, doc) => acc + (doc.document_data.document.totaux.total_ttc_net_a_payer || 0), 0);
        
        setStats({
          total: docs.length,
          draft: docs.filter(d => d.status === 'Brouillon').length,
          validated: docs.filter(d => d.status === 'Validé').length,
          archived: docs.filter(d => d.status === 'Archivé').length,
          totalAmount
        });
      }
    };

    fetchStats();
  }, [userId]);

  const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-slate-500">Vue d'ensemble de vos activités documentaires.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Documents" 
          value={stats.total} 
          icon={FileText} 
          color="bg-blue-500"
          subValue="Tous statuts confondus"
        />
        <StatCard 
          title="En attente" 
          value={stats.draft} 
          icon={Clock} 
          color="bg-yellow-500" 
          subValue="Brouillons à valider"
        />
        <StatCard 
          title="Validés" 
          value={stats.validated} 
          icon={CheckCircle} 
          color="bg-green-500" 
          subValue="Traités ce mois-ci"
        />
        <StatCard 
          title="Montant Total" 
          value={stats.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} 
          icon={Archive} 
          color="bg-indigo-500" 
          subValue="Cumul TTC"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Volume mensuel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="docs" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-blue-600 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">GED Pro Premium</h3>
            <p className="text-blue-100 text-sm mb-4">
              Passez à la version supérieure pour l'extraction automatique par IA et l'archivage légal.
            </p>
          </div>
          <button className="bg-white text-blue-600 py-2 px-4 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">
            Découvrir l'offre
          </button>
        </div>
      </div>
    </div>
  );
};
