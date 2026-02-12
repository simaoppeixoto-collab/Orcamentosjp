
import React, { useState, useRef } from 'react';
import { Part } from '../types';
import { CATEGORIES, formatCurrency } from '../constants';
import { Plus, Trash2, Search, Tag, DollarSign, Image as ImageIcon, Upload, TrendingUp } from 'lucide-react';

interface CatalogViewProps {
  parts: Part[];
  onAddPart: (part: Part) => void;
  onDeletePart: (id: string) => void;
}

const CatalogView: React.FC<CatalogViewProps> = ({ parts, onAddPart, onDeletePart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPart, setNewPart] = useState<Omit<Part, 'id'>>({
    name: '',
    purchasePrice: 0,
    price: 0,
    category: 'Madeira',
    unit: 'un',
    imageUrl: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPart(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!newPart.name || newPart.price <= 0) return;
    onAddPart({
      ...newPart,
      id: Math.random().toString(36).substr(2, 9)
    });
    setNewPart({ name: '', purchasePrice: 0, price: 0, category: 'Madeira', unit: 'un', imageUrl: '' });
    setIsAdding(false);
  };

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Buscar peça no armazém..."
            className="w-full pl-10 pr-4 py-2 bg-stone-800 text-white placeholder-stone-500 border border-stone-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nova Peça
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-lg animate-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-lg mb-6 text-stone-800">Registar Nova Peça</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-stone-500 uppercase block mb-2">Foto do Item</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square w-full bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all relative overflow-hidden group"
              >
                {newPart.imageUrl ? (
                  <img src={newPart.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="text-stone-300 mb-2" size={32} />
                    <span className="text-[10px] text-stone-400 text-center px-4">Carregar Imagem</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>

            <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-3 space-y-1">
                <label className="text-xs font-semibold text-stone-500 uppercase">Nome da Peça</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-stone-800 text-white border border-stone-700 rounded-md outline-none focus:border-amber-500"
                  value={newPart.name}
                  onChange={e => setNewPart({...newPart, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-500 uppercase">Custo Compra (€)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-stone-800 text-white border border-stone-700 rounded-md outline-none focus:border-amber-500"
                  value={newPart.purchasePrice || ''}
                  onChange={e => setNewPart({...newPart, purchasePrice: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-500 uppercase">Preço Venda (€)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-stone-800 text-white border border-stone-700 rounded-md outline-none focus:border-amber-500"
                  value={newPart.price || ''}
                  onChange={e => setNewPart({...newPart, price: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-500 uppercase">Unidade</label>
                <input
                  type="text"
                  placeholder="un, m, par..."
                  className="w-full px-3 py-2 bg-stone-800 text-white border border-stone-700 rounded-md outline-none focus:border-amber-500 placeholder-stone-500"
                  value={newPart.unit}
                  onChange={e => setNewPart({...newPart, unit: e.target.value})}
                />
              </div>
              <div className="space-y-1 md:col-span-2 lg:col-span-1">
                <label className="text-xs font-semibold text-stone-500 uppercase">Categoria</label>
                <select
                  className="w-full px-3 py-2 bg-stone-800 text-white border border-stone-700 rounded-md outline-none focus:border-amber-500"
                  value={newPart.category}
                  onChange={e => setNewPart({...newPart, category: e.target.value})}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-stone-500 font-medium">Cancelar</button>
            <button onClick={handleAdd} className="bg-stone-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-stone-800 transition-colors">Guardar Peça</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Item</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Preço Compra</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Preço Venda</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Margem Bruta</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredParts.map(part => {
              const profit = part.price - part.purchasePrice;
              const margin = part.price > 0 ? (profit / part.price) * 100 : 0;
              return (
                <tr key={part.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                        {part.imageUrl ? <img src={part.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-stone-300 m-3" />}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800 text-sm">{part.name}</p>
                        <p className="text-[10px] text-stone-400 uppercase font-bold">{part.category} / {part.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-stone-500">{formatCurrency(part.purchasePrice)}</td>
                  <td className="px-6 py-4 font-mono text-sm font-bold text-stone-800">{formatCurrency(part.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${margin > 40 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      <TrendingUp size={12} />
                      {margin.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDeletePart(part.id)} className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CatalogView;
