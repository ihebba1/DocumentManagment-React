export type DocumentStatus = 'Brouillon' | 'Validé' | 'Archivé';

export type DocumentType = 'FACTURE' | 'BON_LIVRAISON' | 'BON_COMMANDE' | 'AVOIR' | 'ACOMPTE';

export type NatureDocument = 'VENTE' | 'ACHAT';

export interface Address {
  ligne_1: string;
  ligne_2?: string;
  ville: string;
  code_postal?: string;
  pays: string;
}

export interface Contact {
  telephone?: string;
  email?: string;
  site_web?: string;
}

export interface Bank {
  nom_banque?: string;
  rib?: string;
  iban?: string;
  swift?: string;
}

export interface Vendor {
  raison_sociale: string;
  forme_juridique?: string;
  capital_social?: number;
  matricule_fiscal: string;
  registre_commerce?: string;
  adresse: Address;
  contact?: Contact;
  banque?: Bank;
  CIN?: string;
  passport?: string;
}

export interface Client {
  raison_sociale: string;
  matricule_fiscal: string;
  adresse: Address;
  regime_fiscal?: {
    exonere_tva: boolean;
    suspension_tva: boolean;
    export?: boolean;
    reference_attestation?: string | null;
  };
}

export interface Article {
  code: string;
  designation: string;
  description_longue?: string;
  unite?: string;
  article_serialise: boolean;
  numeros_serie?: string[];
}

export interface DocumentLine {
  ligne_id: number;
  article: Article;
  quantite: number;
  prix_unitaire_ht: number;
  montant_brut_ht: number;
  montant_net_ht: number;
  base_tva?: number;
  tva: {
    taux: number;
    montant: number;
    appliquee: boolean;
  };
  total_ttc_ligne: number;
}

export interface Totals {
  total_brut_ht: number;
  total_net_ht: number;
  total_tva: number;
  timbre_fiscal: number;
  total_ttc_net_a_payer: number;
  montant_en_lettres: string;
  total_remise?: number;
  total_droit_consommation?: number;
  total_fodec?: number;
}

export interface CommercialDocumentData {
  document: {
    type_document: DocumentType;
    nature_document: NatureDocument;
    numero_document: string;
    date_document: string;
    devise: string;
    vendeur: Vendor;
    client: Client;
    lignes: DocumentLine[];
    totaux: Totals;
    mentions_legales?: {
      conditions_paiement?: string;
      tva_detaillee?: any[];
    };
  };
}

export interface GEDDocument {
  id: string;
  created_at: string;
  user_id: string;
  file_url: string;
  status: DocumentStatus;
  document_data: CommercialDocumentData;
}

export type ViewState = 'DASHBOARD' | 'DOCUMENTS' | 'UPLOAD' | 'SETTINGS';