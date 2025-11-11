import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface OptionType {
  value: string;
  label: string;
  entries?: [];
}

interface UseEntityOptionsParams {
  fetchFn: (params?: any) => Promise<any>;
  mapFn: (item: any) => OptionType;
  errorMessage?: string;
  queryParams?: Record<string, any>;
}

export const useEntityOptions = ({
  fetchFn,
  mapFn,
  errorMessage = 'Failed to fetch options',
  queryParams = { limit: 100, page: 1 },
}: UseEntityOptionsParams) => {
  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchFn(queryParams);

        if (!response || !Array.isArray(response.data)) {
          throw new Error('Invalid response: expected array of data');
        }

        const mapped = response.data.map(mapFn);

        setOptions(mapped);

        setError(null);
      } catch (err: any) {
        console.error('Error fetching options:', err);
        setError(err);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { options, loading, error };
};
