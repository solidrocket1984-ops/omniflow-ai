import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import LoadingScreen from '@/components/LoadingScreen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, HelpCircle, Package, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Knowledge() {
  const { user } = useOutletContext();
  const [faqs, setFaqs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqDialog, setFaqDialog] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const accountId = user?.account_id;

  useEffect(() => {
    async function load() {
      if (!accountId) { setLoading(false); return; }
      try {
        const [f, p] = await Promise.all([
          base44.entities.FAQ.filter({ account_id: accountId }, 'order', 50),
          base44.entities.ProductService.filter({ account_id: accountId }, 'order', 50),
        ]);
        setFaqs(f);
        setProducts(p);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [accountId]);

  async function saveFaq(data) {
    if (data.id) {
      const { id, created_date, updated_date, created_by, ...rest } = data;
      await base44.entities.FAQ.update(id, rest);
      setFaqs(prev => prev.map(f => f.id === id ? { ...f, ...rest } : f));
    } else {
      const created = await base44.entities.FAQ.create({ ...data, account_id: accountId });
      setFaqs(prev => [...prev, created]);
    }
    setFaqDialog(false);
    setEditingFaq(null);
    toast.success('FAQ guardada');
  }

  async function saveProduct(data) {
    if (data.id) {
      const { id, created_date, updated_date, created_by, ...rest } = data;
      await base44.entities.ProductService.update(id, rest);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...rest } : p));
    } else {
      const created = await base44.entities.ProductService.create({ ...data, account_id: accountId });
      setProducts(prev => [...prev, created]);
    }
    setProductDialog(false);
    setEditingProduct(null);
    toast.success('Producto/servicio guardado');
  }

  async function deleteFaq(id) {
    await base44.entities.FAQ.delete(id);
    setFaqs(prev => prev.filter(f => f.id !== id));
    toast.success('FAQ eliminada');
  }

  async function deleteProduct(id) {
    await base44.entities.ProductService.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Producto eliminado');
  }

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader title="Base de Conocimiento" description="Gestiona FAQs, productos y servicios que alimentan a tu agente" />

      <Tabs defaultValue="faqs">
        <TabsList className="bg-muted p-1 rounded-lg mb-6">
          <TabsTrigger value="faqs" className="gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> FAQs</TabsTrigger>
          <TabsTrigger value="products" className="gap-1.5"><Package className="w-3.5 h-3.5" /> Productos/Servicios</TabsTrigger>
        </TabsList>

        <TabsContent value="faqs">
          <div className="flex justify-end mb-4">
            <Button size="sm" className="gap-1.5" onClick={() => { setEditingFaq(null); setFaqDialog(true); }}>
              <Plus className="w-4 h-4" /> Nueva FAQ
            </Button>
          </div>
          {faqs.length === 0 ? (
            <EmptyState icon={HelpCircle} title="Sin FAQs" description="Añade preguntas frecuentes para entrenar a tu agente" />
          ) : (
            <div className="space-y-3">
              {faqs.map(faq => (
                <div key={faq.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                      {faq.category && <span className="text-xs text-muted-foreground mt-2 inline-block bg-muted px-2 py-0.5 rounded">{faq.category}</span>}
                    </div>
                    <div className="flex gap-1 ml-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingFaq(faq); setFaqDialog(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteFaq(faq.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <FaqDialog open={faqDialog} onOpenChange={setFaqDialog} faq={editingFaq} onSave={saveFaq} />
        </TabsContent>

        <TabsContent value="products">
          <div className="flex justify-end mb-4">
            <Button size="sm" className="gap-1.5" onClick={() => { setEditingProduct(null); setProductDialog(true); }}>
              <Plus className="w-4 h-4" /> Nuevo producto/servicio
            </Button>
          </div>
          {products.length === 0 ? (
            <EmptyState icon={Package} title="Sin productos" description="Añade productos o servicios para que tu agente los conozca" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map(prod => (
                <div key={prod.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{prod.name}</h4>
                      {prod.price && <span className="text-sm text-primary font-medium">{prod.price}</span>}
                      {prod.description && <p className="text-sm text-muted-foreground mt-1">{prod.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingProduct(prod); setProductDialog(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(prod.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <ProductDialog open={productDialog} onOpenChange={setProductDialog} product={editingProduct} onSave={saveProduct} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FaqDialog({ open, onOpenChange, faq, onSave }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (faq) { setQuestion(faq.question || ''); setAnswer(faq.answer || ''); setCategory(faq.category || ''); }
    else { setQuestion(''); setAnswer(''); setCategory(''); }
  }, [faq, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{faq ? 'Editar FAQ' : 'Nueva FAQ'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Pregunta</Label><Input value={question} onChange={e => setQuestion(e.target.value)} placeholder="¿Cuál es tu pregunta?" /></div>
          <div><Label>Respuesta</Label><Textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Respuesta..." rows={4} /></div>
          <div><Label>Categoría</Label><Input value={category} onChange={e => setCategory(e.target.value)} placeholder="General, Precios, Horarios..." /></div>
          <Button className="w-full" onClick={() => onSave({ ...(faq || {}), question, answer, category })}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductDialog({ open, onOpenChange, product, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cat, setCat] = useState('');

  useEffect(() => {
    if (product) { setName(product.name || ''); setDescription(product.description || ''); setPrice(product.price || ''); setCat(product.category || ''); }
    else { setName(''); setDescription(''); setPrice(''); setCat(''); }
  }, [product, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{product ? 'Editar' : 'Nuevo'} producto/servicio</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Nombre</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>Descripción</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
          <div><Label>Precio</Label><Input value={price} onChange={e => setPrice(e.target.value)} placeholder="Ej: 50€/mes" /></div>
          <div><Label>Categoría</Label><Input value={cat} onChange={e => setCat(e.target.value)} /></div>
          <Button className="w-full" onClick={() => onSave({ ...(product || {}), name, description, price, category: cat })}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}