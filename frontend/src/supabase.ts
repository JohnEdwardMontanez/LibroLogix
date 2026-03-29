import { createClient } from '@supabase/supabase-js';

// 1. Get these from your Supabase Dashboard
const supabaseUrl = 'https://vrymmiacxwqddbwhyydv.supabase.co'; 
const supabaseKey = 'sb_publishable_HxUFlBHx4O7fCOrFAWUawQ_-Yfy5eZi'; // The key from your screenshot

// 2. Create and export the connection
export const supabase = createClient(supabaseUrl, supabaseKey);