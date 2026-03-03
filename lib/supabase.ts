import { createClient } from '@supabase/supabase-js';

// Paste your actual values inside the quotes below
const supabaseUrl = "https://xcclraquassuyenxnpem.supabase.co"; 
const supabaseAnonKey = "sb_publishable_6h7pL15dcS7zIo-V8esAnA_WyxSxEnK"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);