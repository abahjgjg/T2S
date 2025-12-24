
import React from 'react';
import { Star, Link as LinkIcon } from 'lucide-react';
import { AffiliateProduct } from '../../types';

interface Props {
  products: AffiliateProduct[];
  onAffiliateClick: (id: string) => void;
}

export const BlueprintAffiliates: React.FC<Props> = ({ products, onAffiliateClick }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-900/20 to-slate-900 border border-emerald-500/30 rounded-xl p-6 mb-8 relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          Recommended Tools for this Build
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <a 
              key={product.id}
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onAffiliateClick(product.id)}
              className="bg-slate-900 border border-slate-700 hover:border-emerald-500 p-4 rounded-lg group transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{product.name}</h4>
                <LinkIcon className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
              </div>
              <p className="text-sm text-slate-400 line-clamp-2">{product.description || `Optimized for this business type`}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
