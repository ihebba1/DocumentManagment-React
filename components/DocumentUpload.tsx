import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { CommercialDocumentData, DocumentType, NatureDocument, Vendor, Client } from '../types';
import { UploadCloud, Plus, Trash2, Save, CheckCircle, AlertTriangle, Loader2, ChevronDown, Box, Users, CreditCard, ArrowRightLeft } from 'lucide-react';
import { BUCKET_NAME } from '../constants';

interface DocumentUploadProps {
  onSuccess: () => void;
  userId: string;
}

const DOCUMENT_TYPES: { value: DocumentType; label: string; color: string }[] = [
  { value: 'FACTURE', label: 'Facture', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'BON_LIVRAISON', label: 'Bon de Livraison', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'BON_COMMANDE', label: 'Bon de Commande', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'AVOIR', label: 'Avoir', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'ACOMPTE', label: 'Acompte', color: 'bg-orange-100 text-orange-700 border-orange-200' },
];

const NATURE_TYPES: { value: NatureDocument; label: string }[] = [
  { value: 'VENTE', label: 'Vente (Client)' },
  { value: 'ACHAT', label: 'Achat (Fournisseur)' },
];

// --- Sub-components defined outside to prevent re-rendering/focus issues ---

interface VendorSectionProps {
  vendeur: Vendor;
  updateVendor: (field: string, value: any, section?: 'adresse' | 'contact' | 'banque') => void;
  isVente: boolean;
}

const VendorSection: React.FC<VendorSectionProps> = ({ vendeur, updateVendor, isVente }) => (
  <div className={`bg-slate-50 p-6 rounded-xl border ${isVente ? 'border-slate-200' : 'border-blue-200 bg-blue-50'} relative`}>
      <div className="absolute -top-3 left-4 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs font-bold text-slate-600 uppercase flex items-center gap-1">
          <Box size={14} /> {isVente ? 'Vendeur (Nous)' : 'Vendeur (Fournisseur)'}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {/* Identity */}
          <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Identité Entreprise</h4>
              <input type="text" placeholder="Raison Sociale *" required className="w-full p-2 border rounded text-sm" 
                  value={vendeur.raison_sociale} onChange={e => updateVendor('raison_sociale', e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Matricule Fiscal *" required className="w-full p-2 border rounded text-sm" 
                      value={vendeur.matricule_fiscal} onChange={e => updateVendor('matricule_fiscal', e.target.value)} />
                      <input type="text" placeholder="Registre Commerce" className="w-full p-2 border rounded text-sm" 
                      value={vendeur.registre_commerce} onChange={e => updateVendor('registre_commerce', e.target.value)} />
              </div>
                  <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Forme Juridique" className="w-full p-2 border rounded text-sm" 
                      value={vendeur.forme_juridique} onChange={e => updateVendor('forme_juridique', e.target.value)} />
                      <input type="number" placeholder="Capital Social" className="w-full p-2 border rounded text-sm" 
                      value={vendeur.capital_social || ''} onChange={e => updateVendor('capital_social', parseFloat(e.target.value))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="CIN" className="w-full p-2 border rounded text-sm" 
                      value={vendeur.CIN} onChange={e => updateVendor('CIN', e.target.value)} />
                      <input type="text" placeholder="Passeport" className="w-full p-2 border rounded text-sm" 
                      value={vendeur.passport} onChange={e => updateVendor('passport', e.target.value)} />
              </div>
          </div>
          
          {/* Contact & Bank */}
          <div className="space-y-4">
                  <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Coordonnées</h4>
                  <input type="text" placeholder="Adresse complète" className="w-full p-2 border rounded text-sm mb-2" 
                      value={vendeur.adresse.ligne_1} onChange={e => updateVendor('ligne_1', e.target.value, 'adresse')} />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                          <input type="text" placeholder="Ville" className="w-full p-2 border rounded text-sm" 
                          value={vendeur.adresse.ville} onChange={e => updateVendor('ville', e.target.value, 'adresse')} />
                          <input type="text" placeholder="Pays" className="w-full p-2 border rounded text-sm" 
                          value={vendeur.adresse.pays} onChange={e => updateVendor('pays', e.target.value, 'adresse')} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Email" className="w-full p-2 border rounded text-sm" 
                          value={vendeur.contact?.email} onChange={e => updateVendor('email', e.target.value, 'contact')} />
                          <input type="text" placeholder="Téléphone" className="w-full p-2 border rounded text-sm" 
                          value={vendeur.contact?.telephone} onChange={e => updateVendor('telephone', e.target.value, 'contact')} />
                  </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><CreditCard size={12}/> Banque</h4>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                          <input type="text" placeholder="Nom Banque" className="w-full p-2 border rounded text-sm" 
                          value={vendeur.banque?.nom_banque} onChange={e => updateVendor('nom_banque', e.target.value, 'banque')} />
                          <input type="text" placeholder="RIB" className="w-full p-2 border rounded text-sm" 
                          value={vendeur.banque?.rib} onChange={e => updateVendor('rib', e.target.value, 'banque')} />
                  </div>
                  <input type="text" placeholder="IBAN" className="w-full p-2 border rounded text-sm" 
                      value={vendeur.banque?.iban} onChange={e => updateVendor('iban', e.target.value, 'banque')} />
                  </div>
          </div>
      </div>
  </div>
);

interface ClientSectionProps {
  client: Client;
  updateClient: (field: string, value: any, section?: 'adresse' | 'regime_fiscal') => void;
  isVente: boolean;
}

const ClientSection: React.FC<ClientSectionProps> = ({ client, updateClient, isVente }) => (
  <div className={`bg-slate-50 p-6 rounded-xl border ${!isVente ? 'border-slate-200' : 'border-green-200 bg-green-50'} relative`}>
      <div className="absolute -top-3 left-4 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs font-bold text-slate-600 uppercase flex items-center gap-1">
          <Users size={14} /> {isVente ? 'Client (Tiers)' : 'Destinataire (Nous)'}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Identité</h4>
              <input type="text" placeholder="Raison Sociale *" required className="w-full p-2 border rounded text-sm" 
                  value={client.raison_sociale} onChange={e => updateClient('raison_sociale', e.target.value)} />
              <input type="text" placeholder="Matricule Fiscal *" required className="w-full p-2 border rounded text-sm" 
                  value={client.matricule_fiscal} onChange={e => updateClient('matricule_fiscal', e.target.value)} />
          </div>
              <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Adresse & Fiscalité</h4>
              <input type="text" placeholder="Adresse" className="w-full p-2 border rounded text-sm" 
                  value={client.adresse.ligne_1} onChange={e => updateClient('ligne_1', e.target.value, 'adresse')} />
              <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Ville" className="w-full p-2 border rounded text-sm" 
                      value={client.adresse.ville} onChange={e => updateClient('ville', e.target.value, 'adresse')} />
                      <input type="text" placeholder="Pays" className="w-full p-2 border rounded text-sm" 
                      value={client.adresse.pays} onChange={e => updateClient('pays', e.target.value, 'adresse')} />
              </div>
              <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={client.regime_fiscal?.exonere_tva} 
                          onChange={e => updateClient('exonere_tva', e.target.checked, 'regime_fiscal')} />
                      Exonéré TVA
                  </label>
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={client.regime_fiscal?.suspension_tva} 
                          onChange={e => updateClient('suspension_tva', e.target.checked, 'regime_fiscal')} />
                      Suspension TVA
                  </label>
              </div>
          </div>
      </div>
  </div>
);

// --- Main Component ---

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onSuccess, userId }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  // Initial State matching the rich JSON structure
  const [formData, setFormData] = useState<CommercialDocumentData['document']>({
    type_document: 'FACTURE',
    nature_document: 'VENTE',
    numero_document: '',
    date_document: new Date().toISOString().split('T')[0],
    devise: 'TND',
    vendeur: { 
      raison_sociale: '', 
      matricule_fiscal: '', 
      registre_commerce: '',
      capital_social: 0,
      forme_juridique: 'SARL',
      adresse: { ligne_1: '', ville: '', pays: 'Tunisie', code_postal: '' },
      contact: { telephone: '', email: '', site_web: '' },
      banque: { nom_banque: '', iban: '', rib: '', swift: '' },
      CIN: '',
      passport: ''
    },
    client: { 
      raison_sociale: '', 
      matricule_fiscal: '',
      adresse: { ligne_1: '', ville: '', pays: 'Tunisie' },
      regime_fiscal: { exonere_tva: false, suspension_tva: false }
    },
    lignes: [{ 
      ligne_id: 1,
      article: { 
        code: '', 
        designation: '', 
        description_longue: '',
        unite: 'U',
        article_serialise: false,
        numeros_serie: []
      }, 
      quantite: 1, 
      prix_unitaire_ht: 0,
      montant_brut_ht: 0,
      montant_net_ht: 0,
      tva: { taux: 19, montant: 0, appliquee: true },
      total_ttc_ligne: 0 
    }],
    totaux: { 
      total_brut_ht: 0,
      total_net_ht: 0,
      total_tva: 0,
      timbre_fiscal: 1.000,
      total_ttc_net_a_payer: 0,
      montant_en_lettres: ''
    }
  });

  // Calculations
  useEffect(() => {
    let totalHT = 0;
    let totalTVA = 0;

    const newLines = formData.lignes.map(line => {
      const brut = line.quantite * line.prix_unitaire_ht;
      const net = brut; // Implement discount logic here if needed
      
      const tvaMontant = line.tva.appliquee && !formData.client.regime_fiscal?.exonere_tva 
        ? (net * (line.tva.taux / 100)) 
        : 0;
        
      const ttc = net + tvaMontant;

      totalHT += net;
      totalTVA += tvaMontant;

      return {
        ...line,
        montant_brut_ht: Number(brut.toFixed(3)),
        montant_net_ht: Number(net.toFixed(3)),
        tva: { ...line.tva, montant: Number(tvaMontant.toFixed(3)) },
        total_ttc_ligne: Number(ttc.toFixed(3))
      };
    });

    const calcTotalTTC = totalHT + totalTVA + (formData.totaux.timbre_fiscal || 0);

    setFormData(prev => ({
      ...prev,
      totaux: {
        ...prev.totaux,
        total_brut_ht: Number(totalHT.toFixed(3)),
        total_net_ht: Number(totalHT.toFixed(3)),
        total_tva: Number(totalTVA.toFixed(3)),
        total_ttc_net_a_payer: Number(calcTotalTTC.toFixed(3))
      }
    }));
  }, [
    JSON.stringify(formData.lignes.map(l => ({ q: l.quantite, p: l.prix_unitaire_ht, t: l.tva.taux, app: l.tva.appliquee }))),
    formData.totaux.timbre_fiscal,
    formData.client.regime_fiscal?.exonere_tva
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const updateVendor = (field: string, value: any, section?: 'adresse' | 'contact' | 'banque') => {
    setFormData(prev => {
      if (section) {
        return {
          ...prev,
          vendeur: {
            ...prev.vendeur,
            [section]: { ...((prev.vendeur as any)[section] || {}), [field]: value }
          }
        };
      }
      return { ...prev, vendeur: { ...prev.vendeur, [field]: value } };
    });
  };

  const updateClient = (field: string, value: any, section?: 'adresse' | 'regime_fiscal') => {
    setFormData(prev => {
        if (section) {
          return {
            ...prev,
            client: {
              ...prev.client,
              [section]: { ...((prev.client as any)[section] || {}), [field]: value }
            }
          };
        }
        return { ...prev, client: { ...prev.client, [field]: value } };
      });
  };

  const updateLine = (index: number, path: string, value: any) => {
    setFormData(prev => {
      const newLines = [...prev.lignes];
      const line = { ...newLines[index] };
      
      if (path.includes('.')) {
        const [obj, key] = path.split('.');
        (line as any)[obj] = { ...(line as any)[obj], [key]: value };
      } else {
        (line as any)[path] = value;
      }
      
      newLines[index] = line;
      return { ...prev, lignes: newLines };
    });
  };

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lignes: [...prev.lignes, {
        ligne_id: prev.lignes.length + 1,
        article: { code: '', designation: '', unite: 'U', article_serialise: false, numeros_serie: [] },
        quantite: 1,
        prix_unitaire_ht: 0,
        montant_brut_ht: 0,
        montant_net_ht: 0,
        tva: { taux: 19, montant: 0, appliquee: true },
        total_ttc_ligne: 0
      }]
    }));
  };

  const removeLine = (index: number) => {
    if (formData.lignes.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      lignes: prev.lignes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}_${formData.type_document}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          file_url: fileName,
          status: 'Brouillon',
          document_data: { document: formData }
        });

      if (dbError) throw dbError;
      onSuccess();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const selectedTypeObj = DOCUMENT_TYPES.find(t => t.value === formData.type_document);
  const isVente = formData.nature_document === 'VENTE';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Nouveau Document</h2>
          <p className="text-sm text-slate-500">Saisie d'un document commercial</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-end gap-4">
             {/* Nature Dropdown */}
            <div className="flex flex-col items-start gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Nature Document</label>
                <div className="relative">
                     <select 
                        value={formData.nature_document}
                        onChange={(e) => setFormData({...formData, nature_document: e.target.value as NatureDocument})}
                        className="appearance-none pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none w-48"
                    >
                        {NATURE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                    <ArrowRightLeft className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                </div>
            </div>

            {/* Type Dropdown */}
            <div className="flex flex-col items-start gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Type de document</label>
                <div className="relative">
                    <select 
                        value={formData.type_document}
                        onChange={(e) => setFormData({...formData, type_document: e.target.value as DocumentType})}
                        className="appearance-none pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none w-48"
                    >
                        {DOCUMENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                </div>
            </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Upload Area */}
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors text-center cursor-pointer relative group">
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                required
            />
            {file ? (
                <div className="flex flex-col items-center text-green-600">
                    <CheckCircle className="w-8 h-8 mb-2" />
                    <span className="font-medium">{file.name}</span>
                </div>
            ) : (
                <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-500 transition-colors">
                    <UploadCloud className="w-8 h-8 mb-2" />
                    <span className="font-medium">Glisser un fichier ou cliquer pour uploader</span>
                    <span className="text-xs mt-1">PDF, Image (Max 10MB)</span>
                </div>
            )}
        </div>

        {/* 1. Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Numéro Document</label>
                <input 
                    type="text" required
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.numero_document}
                    onChange={e => setFormData({...formData, numero_document: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                <input 
                    type="date" required
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.date_document}
                    onChange={e => setFormData({...formData, date_document: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Devise</label>
                <select
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.devise}
                    onChange={e => setFormData({...formData, devise: e.target.value})}
                >
                    <option value="TND">TND</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                </select>
            </div>
        </div>

        {/* 2 & 3. Parties (Vendeur / Client) - Order depends on Nature */}
        <div className="flex flex-col gap-8">
            {isVente ? (
                <>
                    <VendorSection 
                        vendeur={formData.vendeur} 
                        updateVendor={updateVendor} 
                        isVente={isVente} 
                    />
                    <ClientSection 
                        client={formData.client} 
                        updateClient={updateClient} 
                        isVente={isVente} 
                    />
                </>
            ) : (
                <>
                    <VendorSection 
                        vendeur={formData.vendeur} 
                        updateVendor={updateVendor} 
                        isVente={isVente} 
                    />
                    <ClientSection 
                        client={formData.client} 
                        updateClient={updateClient} 
                        isVente={isVente} 
                    />
                </>
            )}
        </div>

        {/* 4. Lignes de détail */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Lignes du document</h3>
                <button type="button" onClick={addLine} className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center">
                    <Plus size={16} className="mr-1" /> Ajouter ligne
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-10">#</th>
                            <th className="px-4 py-3">Article</th>
                            <th className="px-4 py-3 w-20">Unité</th>
                            <th className="px-4 py-3 w-20 text-right">Qté</th>
                            <th className="px-4 py-3 w-28 text-right">P.U. HT</th>
                            <th className="px-4 py-3 w-20 text-right">TVA %</th>
                            <th className="px-4 py-3 w-32 text-right">Total HT</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {formData.lignes.map((line, idx) => (
                            <React.Fragment key={idx}>
                                <tr className="hover:bg-slate-50 align-top">
                                    <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                                    <td className="px-4 py-3 space-y-2">
                                        <div className="flex gap-2">
                                             <input type="text" placeholder="Code" className="w-1/3 p-1.5 border border-slate-200 rounded text-xs"
                                                value={line.article.code} onChange={e => updateLine(idx, 'article.code', e.target.value)} />
                                            <input type="text" placeholder="Désignation" required className="w-2/3 p-1.5 border border-slate-200 rounded text-xs font-medium"
                                                value={line.article.designation} onChange={e => updateLine(idx, 'article.designation', e.target.value)} />
                                        </div>
                                        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                                            <input type="checkbox" checked={line.article.article_serialise}
                                                onChange={e => updateLine(idx, 'article.article_serialise', e.target.checked)} />
                                            Article sérialisé
                                        </label>
                                        {line.article.article_serialise && (
                                            <textarea placeholder="Numéros de série (un par ligne)"
                                                className="w-full p-2 border border-blue-100 bg-blue-50 rounded text-xs text-blue-700 focus:outline-none"
                                                rows={2} value={line.article.numeros_serie?.join('\n')}
                                                onChange={e => updateLine(idx, 'article.numeros_serie', e.target.value.split('\n'))} />
                                        )}
                                    </td>
                                     <td className="px-4 py-3">
                                        <input type="text" className="w-full p-1.5 border border-slate-200 rounded text-center"
                                            value={line.article.unite} onChange={e => updateLine(idx, 'article.unite', e.target.value)} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="number" min="0" step="0.1" className="w-full p-1.5 border border-slate-200 rounded text-right"
                                            value={line.quantite} onChange={e => updateLine(idx, 'quantite', parseFloat(e.target.value))} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="number" step="0.001" className="w-full p-1.5 border border-slate-200 rounded text-right"
                                            value={line.prix_unitaire_ht} onChange={e => updateLine(idx, 'prix_unitaire_ht', parseFloat(e.target.value))} />
                                    </td>
                                     <td className="px-4 py-3">
                                        <input type="number" step="0.1" className="w-full p-1.5 border border-slate-200 rounded text-right"
                                            value={line.tva.taux} onChange={e => updateLine(idx, 'tva.taux', parseFloat(e.target.value))} />
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-700">
                                        {(line.quantite * line.prix_unitaire_ht).toFixed(3)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button type="button" onClick={() => removeLine(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 5. Totals Footer */}
        <div className="flex flex-col md:flex-row justify-end items-start gap-8">
            <div className="w-full md:w-1/2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Montant en toutes lettres</label>
                <textarea 
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors outline-none resize-none h-24"
                    placeholder="Arrêtée la présente facture à la somme de..."
                    value={formData.totaux.montant_en_lettres}
                    onChange={e => setFormData({...formData, totaux: {...formData.totaux, montant_en_lettres: e.target.value}})}
                />
            </div>
            
            <div className="w-full md:w-1/3 bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                    <span>Total HT Global</span>
                    <span className="font-mono">{formData.totaux.total_net_ht.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                    <span>Total TVA</span>
                    <span className="font-mono">{formData.totaux.total_tva.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 items-center">
                    <span className="border-b border-slate-300 border-dashed cursor-help" title="Droit de timbre">Timbre Fiscal</span>
                    <input type="number" step="0.100" className="w-20 text-right p-1 bg-white border border-slate-200 rounded text-xs"
                        value={formData.totaux.timbre_fiscal}
                        onChange={e => setFormData({...formData, totaux: {...formData.totaux, timbre_fiscal: parseFloat(e.target.value)}})} />
                </div>
                
                <div className="border-t border-slate-300 pt-3 mt-2 flex justify-between items-end">
                    <div>
                        <span className="block font-bold text-slate-800">Total TTC</span>
                        <span className="text-xs text-slate-500">Net à payer</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600 font-mono">
                        {formData.totaux.total_ttc_net_a_payer.toFixed(3)} <span className="text-sm text-slate-400">{formData.devise}</span>
                    </span>
                </div>
            </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-6 border-t border-slate-100">
            <button
                type="submit" disabled={loading}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg text-white font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${selectedTypeObj?.color.replace('bg-', 'bg-').replace('100', '600').replace('text-', 'text-white ')}`}
                style={{ backgroundColor: '' }}>
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                <span>Enregistrer {selectedTypeObj?.label}</span>
            </button>
        </div>
      </form>
    </div>
  );
};