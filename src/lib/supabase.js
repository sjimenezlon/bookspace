import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yuahkndzssmzmgbfggpf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YWhrbmR6c3Ntem1nYmZnZ3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTY2MTYsImV4cCI6MjA4OTA3MjYxNn0.waR7ZjI15sjZ1WAUEX9reBUB9HYrsebC8PERNjHqB0o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
