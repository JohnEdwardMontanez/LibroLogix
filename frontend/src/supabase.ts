import { createClient } from '@supabase/supabase-js';

// Your correct Project URL
const supabaseUrl = 'https://vrymmiacxwqddbwhyydv.supabase.co'; 

// IMPORTANT: Replace this string with your REAL Supabase 'anon' key. 
// Do NOT use the sb_publishable key. It MUST start with "eyJ"
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeW1taWFjeHdxZGRid2h5eWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzA3ODcsImV4cCI6MjA5MDMwNjc4N30.UNqH5GtGOOG50gRBG3s2oA7FkddXCEvSXZR4lVb9Icg'; 

export const supabase = createClient(supabaseUrl, supabaseKey);