import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface UseSupabaseDataOptions {
  table: string;
  columns?: string;
  filter?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  dependencies?: any[];
}

export function useSupabaseData<T>(options: UseSupabaseDataOptions) {
  const { table, columns = '*', filter, orderBy, limit, dependencies = [] } = options;
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase
          .from(table)
          .select(columns);
        
        // Apply filters if provided
        if (filter) {
          Object.entries(filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        
        // Apply ordering if provided
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
        }
        
        // Apply limit if provided
        if (limit) {
          query = query.limit(limit);
        }
        
        const { data: result, error: queryError } = await query;
        
        if (queryError) throw queryError;
        
        setData(result || []);
      } catch (err: any) {
        console.error(`Error fetching data from ${table}:`, err);
        setError(err.message || `Failed to load data from ${table}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, table, columns, JSON.stringify(filter), JSON.stringify(orderBy), limit, ...dependencies]);

  return { data, loading, error, refetch: () => setLoading(true) };
}