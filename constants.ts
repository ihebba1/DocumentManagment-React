// Configuration for Supabase
// In a real production environment, these should be in process.env

export const SUPABASE_URL = 'https://mwirutsjqesqpbphggua.supabase.co';

// Updated with the provided publishable key
export const SUPABASE_KEY = 'sb_publishable_ygPCeqiysmXDHiau1hsOig_bqYrjOEe'; 

export const BUCKET_NAME = 'documents';
export const TABLE_NAME = 'documents';

// Colors for status badges
export const STATUS_COLORS = {
  'Brouillon': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Validé': 'bg-green-100 text-green-800 border-green-200',
  'Archivé': 'bg-gray-100 text-gray-800 border-gray-200',
};