import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SiteContent = Record<string, string>;

export const useSiteContent = () => {
  const [content, setContent] = useState<SiteContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('site_content').select('key, value');
      if (data) {
        const map: SiteContent = {};
        data.forEach((row: any) => { map[row.key] = row.value; });
        setContent(map);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { content, loading };
};
