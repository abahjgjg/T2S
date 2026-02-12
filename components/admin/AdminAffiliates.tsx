import React, { useState, useMemo, Suspense, lazy } from 'react';
import { AffiliateProduct } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { toast } from '../ToastNotifications';
import { Plus, Edit2, Save, AlertCircle, BarChart3, Package, MousePointerClick, Tag, Link, Trash2, Download } from 'lucide-react';
import { ANIMATION_DURATION, ANIMATION_EASING } from '../../constants/animationConfig';
import { DISPLAY_LIMITS } from '../../constants/displayLimits';
import { useConfirm } from '../../contexts/ConfirmContext';

// Lazy load chart component to reduce initial bundle
const AffiliatesBarChart = lazy(() => import('./AffiliatesBarChart'));

const ChartFallback = () => (
  <div className="h-48 w-full flex items-center justify-center">
    <div className="animate-pulse text-slate-500 text-xs">Loading...</div>
  </div>
);

interface Props {
  products: AffiliateProduct[];
  onRefresh: () => Promise<void>;
}

export const AdminAffiliates: React.FC<Props> = ({ products, onRefresh }) => {
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AffiliateProduct>>({
    name: '',
    affiliateUrl: '',
    description: '',
    keywords: []
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const { confirm } = useConfirm();

  // --- Helpers ---

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setUrlError(null);
      return false;
    }
    try {
      new URL(url);
      if (!url.startsWith('http')) {
        setUrlError("URL must start with http:// or https://");
        return false;
      }
      setUrlError(null);
      return true;
    } catch (_) {
      setUrlError("Invalid URL format");
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, affiliateUrl: val });
    if (val) validateUrl(val);
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordInput(e.target.value);
    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
    setFormData({ ...formData, keywords });
  };

  const resetForm = () => {
    setFormData({ name: '', affiliateUrl: '', description: '', keywords: [] });
    setKeywordInput('');
    setEditingId(null);
    setUrlError(null);
  };

  // --- Actions ---

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.affiliateUrl || !validateUrl(formData.affiliateUrl)) return;

    let currentClicks = 0;
    if (editingId) {
      const existing = products.find(p => p.id === editingId);
      if (existing) currentClicks = existing.clicks || 0;
    }

    const product: AffiliateProduct = {
      id: editingId || crypto.randomUUID(),
      name: formData.name,
      affiliateUrl: formData.affiliateUrl,
      description: formData.description || '',
      keywords: formData.keywords || [],
      clicks: currentClicks
    };

    await supabaseService.saveAffiliateProduct(product);
    await onRefresh();
    resetForm();
    toast.success(editingId ? "Product updated" : "Product added");
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Product?',
      message: 'Delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await supabaseService.deleteAffiliateProduct(id);
      await onRefresh();
      toast.success("Product deleted");
    }
  };

  const handleEditProduct = (product: AffiliateProduct) => {
    setEditingId(product.id);
    setFormData(product);
    setKeywordInput(product.keywords.join(', '));
    setUrlError(null);
  };

  const downloadCSV = () => {
    if (!products.length) {
      toast.info("No data to export");
      return;
    }
    const headers = Object.keys(products[0]);
    const csvContent = [
      headers.join(','),
      ...products.map(row => headers.map(fieldName => {
        // @ts-ignore
        const val = row[fieldName];
        const strVal = typeof val === 'object' ? JSON.stringify(val).replace(/,/g, ';') : String(val ?? '');
        return `"${strVal}"`;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'affiliate_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV Exported");
  };

  // --- Analytics ---

  const clickData = useMemo(() => {
    return products
      .map(p => ({ name: p.name, clicks: p.clicks || 0 }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, DISPLAY_LIMITS.analytics.dataPoints);
  }, [products]);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 animate-[fadeIn_${ANIMATION_DURATION.standard.normal}ms_${ANIMATION_EASING.default}]`}>
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg sticky top-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            {editingId ? <Edit2 className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-emerald-400" />}
            {editingId ? 'Edit Product' : 'Add Product'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Product Name</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Bluehost"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Affiliate Link</label>
              <input
                type="text"
                className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${urlError ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'}`}
                value={formData.affiliateUrl}
                onChange={handleUrlChange}
                placeholder="https://..."
              />
              {urlError && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" /> {urlError}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Keywords (comma separated)</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                value={keywordInput}
                onChange={handleKeywordChange}
                placeholder="hosting, server, vps"
              />
              <p className="text-[10px] text-slate-500 mt-1">Triggers auto-injection in blueprints.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Description</label>
              <textarea
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short recommendation text..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveProduct}
                disabled={!!urlError || !formData.name || !formData.affiliateUrl}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* List & Analytics */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Analytics Chart */}
        {clickData.some(p => p.clicks > 0) && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-64">
             <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
               <BarChart3 className="w-4 h-4" /> Performance (Clicks)
             </h4>
               <Suspense fallback={<ChartFallback />}>
                 <AffiliatesBarChart data={clickData} />
               </Suspense>
          </div>
        )}

        {/* Product List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
           <div className="p-4 border-b border-slate-800 flex justify-between items-center">
             <h4 className="font-bold text-white flex items-center gap-2">
               <Package className="w-4 h-4" /> Active Products ({products.length})
             </h4>
             <button 
               onClick={downloadCSV}
               className="text-xs flex items-center gap-1 text-slate-400 hover:text-white"
             >
               <Download className="w-3 h-3" /> Export CSV
             </button>
           </div>
           <div className="divide-y divide-slate-800">
             {products.length === 0 ? (
               <div className="p-8 text-center text-slate-500">No products added yet.</div>
             ) : (
               products.map(product => (
                 <div key={product.id} className="p-4 hover:bg-slate-800/50 transition-colors flex justify-between items-center">
                   <div>
                     <div className="flex items-center gap-2">
                       <h5 className="font-bold text-white">{product.name}</h5>
                       <span className="text-xs bg-slate-950 px-2 py-0.5 rounded text-emerald-400 font-mono flex items-center gap-1">
                         <MousePointerClick className="w-3 h-3" /> {product.clicks || 0}
                       </span>
                     </div>
                     <div className="flex flex-wrap gap-1 mt-1">
                       {product.keywords.map((k, i) => (
                         <span key={i} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 flex items-center gap-1">
                           <Tag className="w-2 h-2" /> {k}
                         </span>
                       ))}
                     </div>
                     <a href={product.affiliateUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1">
                       <Link className="w-3 h-3" /> {product.affiliateUrl}
                     </a>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        aria-label="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>

      </div>
    </div>
  );
};
