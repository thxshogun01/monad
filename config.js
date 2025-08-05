// Supabase Configuration
const SUPABASE_CONFIG = {
  url: 'https://emicwetdxsgsdaldrils.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtaWN3ZXRkeHNnc2RhbGRyaWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTk5NzcsImV4cCI6MjA2OTk5NTk3N30.3Z1Kwp-dx3fa-1ZY2OgOtaVEOOrlcLlMCQ2N97gberE'
};

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey); 