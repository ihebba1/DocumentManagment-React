
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { GEDDocument, DocumentType } from '../types';
import { STATUS_COLORS, BUCKET_NAME } from '../constants';
import { FileText, Download, Eye, Loader2, Search, AlertCircle, Trash2 } from 'lucide-react';

interface DocumentListProps {
  userId: string;
}

const TYPE_LABELS: Record<DocumentType, string> = {
  'FACTURE': 'Facture',
  'BON_LIVRAISON': 'Bon Livr.',
  'BON_COMMANDE': 'Bon Cmd.',
  'AVOIR': 'Avoir',
  'ACOMPTE': 'Acompte'
};

const TYPE_COLORS: Record<DocumentType, string> = {
  'FACTURE': 'text-blue-600 bg-blue-50',
  'BON_LIVRAISON': 'text-green-600 bg-green-50',
  'BON_COMMANDE': 'text-purple-600 bg-purple-50',
  'AVOIR': 'text-red-600 bg-red-50',
  'ACOMPTE': 'text-orange-600 bg-orange-50'
};

// Sub-component to handle secure URL generation and Actions
const DocumentActions = ({ 
  filePath, 
  fileName, 
  onDelete 
}: { 
  filePath: string, 
  fileName: string, 
  onDelete: () => Promise<void> 
}) => {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(false);

  const handleAction = async (action: 'view' | 'download') => {
    setLoading(true);
    setError(false);
    
    let downloadName = fileName; 
    
    if (action === 'download') {
        let extension = 'pdf';
        if (filePath) {
            const parts = filePath.split('.');
            if (parts.length > 1) {
                const ext = parts.pop();
                if (ext && ext.length < 10) { 
                    extension = ext.toLowerCase().split('?')[0];
                }
            }
        }
        const safeBaseName = fileName
            .replace(/[^a-zA-Z0-9\-_ ]/g, '')
            .trim()
            .replace(/\s+/g, '_');
            
        downloadName = `${safeBaseName || 'Document'}.${extension}`;
    }
    
    let viewWindow: Window | null = null;
    if (action === 'view') {
      viewWindow = window.open('', '_blank');
      if (viewWindow) {
        viewWindow.document.write(`
          <div style="font-family:sans-serif;padding:20px;text-align:center;">
            <p>Chargement du document sécurisé...</p>
          </div>
        `);
        viewWindow.document.title = fileName;
      }
    }

    try {
      let finalUrl = filePath;

      if (!filePath.startsWith('http')) {
        const options: { download?: string | boolean } = {};
        if (action === 'download') {
            options.download = downloadName;
        }

        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(filePath, 60 * 60, options);

        if (error) throw error;
        finalUrl = data.signedUrl;
      }

      if (action === 'view') {
        if (viewWindow) {
          viewWindow.location.href = finalUrl;
        } else {
            window.open(finalUrl, '_blank');
        }
      } else {
        const link = document.createElement('a');
        link.href = finalUrl;
        link.setAttribute('download', downloadName);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(finalUrl);
        }, 100);
      }

    } catch (err) {
      console.error("Error generating URL:", err);
      setError(true);
      if (viewWindow) viewWindow.close();
      alert("Impossible d'accéder au fichier.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } catch (e) {
      console.error(e);
      setDeleting(false); 
    }
    setDeleting(false);
  };

  return (
    <div className="flex justify-end space-x-2">
      <button 
        onClick={() => handleAction('view')}
        disabled={loading || deleting}
        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        title="Voir"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
      </button>
      <button 
        onClick={() => handleAction('download')}
        disabled={loading || deleting}
        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        title="Télécharger"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
      </button>
      <button 
        onClick={handleDeleteClick}
        disabled={loading || deleting}
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        title="Supprimer"
      >
        {deleting ? <Loader2 size={18} className="animate-spin text-red-600" /> : <Trash2 size={18} />}
      </button>
      {error && (
        <span title="Erreur d'accès" className="flex items-center">
          <AlertCircle size={18} className="text-red-500" />
        </span>
      )}
    </div>
  );
};

export const DocumentList: React.FC<DocumentListProps> = ({ userId }) => {
  const [documents, setDocuments] = useState<GEDDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
    } else {
      setDocuments(data as unknown as GEDDocument[]);
    }
    setLoading(false);
  };

  const handleDelete = async (docId: string, filePath: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce document ?")) {
      return;
    }
    
    try {
      if (filePath) {
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      }
      const { error: dbError } = await supabase.from('documents').delete().eq('id', docId);
      if (dbError) throw dbError;
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err: any) {
      console.error("Error deleting document:", err);
      alert("Une erreur est survenue lors de la suppression.");
    }
  };

  const getDocName = (doc: GEDDocument) => {
    const type = doc.document_data?.document?.type_document;
    const num = doc.document_data?.document?.numero_document;
    const label = TYPE_LABELS[type] || 'Document';
    
    if (num) return `${label} #${num}`;
    
    if (doc.file_url) {
        const parts = doc.file_url.split('/');
        return parts[parts.length - 1];
    }
    return 'Document sans nom';
  };

  const filteredDocs = documents.filter(doc => {
    const searchLower = searchTerm.toLowerCase();
    const vendor = doc.document_data?.document?.vendeur?.raison_sociale?.toLowerCase() || '';
    const displayName = getDocName(doc).toLowerCase();
    const number = doc.document_data?.document?.numero_document?.toLowerCase() || '';
    return vendor.includes(searchLower) || displayName.includes(searchLower) || number.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500">
          {filteredDocs.length} document(s) trouvé(s)
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Document</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Vendeur</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Montant</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Aucun document trouvé.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                    const type = doc.document_data?.document?.type_document;
                    const typeClass = TYPE_COLORS[type] || 'text-slate-600 bg-slate-50';
                    const typeLabel = TYPE_LABELS[type] || type || 'Autre';

                    return (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className={`p-2 rounded-lg mr-3 ${typeClass}`}>
                                <FileText size={20} />
                                </div>
                                <div>
                                <div className="font-medium text-slate-800">{doc.document_data.document.numero_document || 'Sans numéro'}</div>
                                <div className="text-xs text-slate-400 font-semibold uppercase">{typeLabel}</div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                            {doc.document_data.document.vendeur.raison_sociale || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(doc.document_data.document.date_document).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-800 text-right font-mono">
                            {doc.document_data.document.totaux.total_ttc_net_a_payer.toLocaleString('fr-FR', { style: 'currency', currency: doc.document_data.document.devise || 'EUR' })}
                            </td>
                            <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-800'}`}>
                                {doc.status}
                            </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                            <DocumentActions 
                                filePath={doc.file_url} 
                                fileName={getDocName(doc)} 
                                onDelete={() => handleDelete(doc.id, doc.file_url)}
                            />
                            </td>
                        </tr>
                    )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
