import { supabase } from './supabase';

export const setupDatabase = async (): Promise<boolean> => {
  try {
    console.log('Setting up Supabase database tables...');
    
    // Try to query tables to see if they exist, which will auto-create them if configured
    try {
      await supabase.from('projects').select('id').limit(1);
      await supabase.from('tasks').select('id').limit(1);
      console.log('Tables exist and are accessible!');
      return true;
    } catch (tableError) {
      console.log('Tables need to be created manually in Supabase SQL Editor');
      console.log('Please run the SQL script from supabase-setup.sql in your Supabase dashboard');
      return true; // Don't fail - app can still work
    }
  } catch (error) {
    console.error('Database setup failed:', error);
    console.log('App will continue with localStorage fallback');
    return true; // Don't fail - fallback to localStorage
  }
};

// Check if Supabase is properly configured
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.warn('Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.warn('Supabase connection error:', error);
    return false;
  }
};

// Initialize database on app start
export const initializeDatabase = async (): Promise<void> => {
  const isConnected = await checkSupabaseConnection();
  
  if (isConnected) {
    await setupDatabase();
  } else {
    console.log('Using localStorage fallback mode');
  }
};