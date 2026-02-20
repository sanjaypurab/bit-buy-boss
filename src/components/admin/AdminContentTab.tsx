import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

const CONTENT_FIELDS = [
  { key: 'hero_badge', label: 'Hero Badge Text', multiline: false },
  { key: 'hero_title_line1', label: 'Hero Title Line 1', multiline: false },
  { key: 'hero_title_line2', label: 'Hero Title Line 2 (gradient)', multiline: false },
  { key: 'hero_subtitle', label: 'Hero Subtitle', multiline: true },
  { key: 'features_title', label: 'Features Section Title', multiline: false },
  { key: 'features_subtitle', label: 'Features Section Subtitle', multiline: true },
  { key: 'cta_title', label: 'CTA Title', multiline: false },
  { key: 'cta_subtitle', label: 'CTA Subtitle', multiline: true },
];

const AdminContentTab = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('site_content').select('key, value');
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: any) => { map[r.key] = r.value; });
        setContent(map);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const field of CONTENT_FIELDS) {
        if (content[field.key] !== undefined) {
          const { error } = await supabase
            .from('site_content')
            .update({ value: content[field.key], updated_at: new Date().toISOString() })
            .eq('key', field.key);
          if (error) throw error;
        }
      }
      toast({ title: 'Saved', description: 'Homepage content updated successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Homepage Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {CONTENT_FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label>{field.label}</Label>
            {field.multiline ? (
              <Textarea
                value={content[field.key] || ''}
                onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                rows={3}
              />
            ) : (
              <Input
                value={content[field.key] || ''}
                onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
              />
            )}
          </div>
        ))}
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminContentTab;
