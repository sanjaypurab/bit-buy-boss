import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, ImageIcon, Pencil, Check, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
}

const AdminCategoriesTab = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const addCategory = async () => {
    if (!newName.trim()) return;
    setUploading(true);

    try {
      let imageUrl: string | null = null;

      if (newImage) {
        const ext = newImage.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('category-images')
          .upload(filePath, newImage);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('category-images')
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('categories').insert({
        name: newName.trim(),
        image_url: imageUrl,
        sort_order: categories.length,
      });

      if (error) throw error;

      toast({ title: 'Category created' });
      setNewName('');
      setNewImage(null);
      fetchCategories();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Category deleted' });
      fetchCategories();
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditImage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditImage(null);
  };

  const saveEdit = async (cat: Category) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      let imageUrl = cat.image_url;
      if (editImage) {
        const ext = editImage.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('category-images')
          .upload(filePath, editImage);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('category-images')
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }
      const { error } = await supabase.from('categories').update({
        name: editName.trim(),
        image_url: imageUrl,
      }).eq('id', cat.id);
      if (error) throw error;
      toast({ title: 'Category updated' });
      setEditingId(null);
      fetchCategories();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Category Name</Label>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Marketing Tools" />
          </div>
          <div>
            <Label>Category Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={e => setNewImage(e.target.files?.[0] || null)}
            />
          </div>
          <Button onClick={addCategory} disabled={uploading || !newName.trim()} className="gap-2">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Category
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {categories.map(cat => (
          <Card key={cat.id}>
            <CardContent className="flex items-center gap-4 py-4">
              {editingId === cat.id ? (
                <>
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <Input value={editName} onChange={e => setEditName(e.target.value)} />
                    <Input type="file" accept="image/*" onChange={e => setEditImage(e.target.files?.[0] || null)} />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => saveEdit(cat)} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-primary" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={cancelEdit}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </>
              ) : (
                <>
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{cat.name}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => startEdit(cat)}>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteCategory(cat.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No categories yet</p>
        )}
      </div>
    </div>
  );
};

export default AdminCategoriesTab;
