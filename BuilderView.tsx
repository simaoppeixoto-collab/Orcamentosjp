
import React, { useState, useMemo } from 'react';
import { Part, ProjectItem, Project } from '../types';
import { Search, Plus, Minus, Trash2, Calculator, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../constants';

interface BuilderViewProps {
  catalog: Part[];
  onSaveProject: (project: Project) => void;
}

const BuilderView: React.FC<BuilderViewProps> = ({ catalog, onSaveProject }) => {
  const [projectName, setProjectName] = useState('');
  const [selectedItems, setSelectedItems] = useState<ProjectItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCatalog = catalog.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (part: Part) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.partId === part.id);
      if (existing) {
        return prev.map(i => i.partId === part.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { partId: part.id, quantity: 1 }];
    });
  };

  const updateQuantity = (partId: string, delta: number) => {
    setSelectedItems(prev => prev.map(i => {
      if (i.partId === partId) {
        const newQty = Math.max(0.1, i.quantity + delta);
        return { ...i, quantity: Number(newQty.toFixed(2)) };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  // Fix: Added missing removeItem function
  const removeItem = (partId: string) => {
    setSelectedItems(prev => prev.filter(i => i.partId !== partId));
  };

  const setQuantity = (partId: string, value: string) => {
    const numValue = parseFloat(value);
    setSelectedItems(prev => prev.map(i => {
      if (i.partId === partId) {
        // Permitimos valores temporários inválidos enquanto o utilizador digita
        // mas garantimos um mínimo de 0.1 no cálculo final se necessário
        const newQty = isNaN(numValue) ? 0 : numValue;
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const finance = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const part = catalog.find(p => p.id === item.partId);
      if (!part) return acc;
      
      const qty = item.quantity || 0;
      const costTotal = part.purchasePrice * qty;
      const saleTotal = part.price * qty;
      
      acc.totalCost += costTotal;
      acc.totalSale += saleTotal;
      
      if (!acc.byCategory[part.category]) acc.byCategory[part.category] = 0;
      acc.byCategory[part.category] += saleTotal;
      
      return acc;
    }, { totalCost: 0, totalSale: 0, byCategory: {} as Record<string, number> });
  }, [selectedItems, catalog]);

  const totalProfit = finance.totalSale - finance.totalCost;
  const profitMargin = finance.totalSale > 0 ? (totalProfit / finance.totalSale) * 100 : 0;

  const handleSave = () => {
    if (!projectName || selectedItems.length === 0) return;
    // Limpeza final de quantidades antes de guardar
    const cleanedItems = selectedItems.map(i => ({
      ...i,
      quantity: Math.max(0.1, i.quantity || 0.1)
    }));
    
    onSaveProject({
      id: Math.random().toString(36).substr(2, 9),
      name: projectName,
      items: cleanedItems,
      createdAt: Date.now()
    });
    setProjectName('');
    setSelectedItems([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
      {/* Catálogo lateral */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Search size={18} className="text-amber-600" />
            Escolher Peças
          </h3>
          <input
            type="text"
            placeholder="Filtrar catálogo..."
            className="w-full px-4 py-2 bg-stone-800 text-white placeholder-stone-500 border border-stone-700 rounded-lg outline-none mb-4 focus:ring-2 focus:ring-amber-500 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredCatalog.map(part => (
              <button key={part.id} onClick={() => addItem(part)} className="w-full text-left p-2 rounded-xl border border-stone-100 hover:border-amber-500 hover:bg-amber-50 group transition-all">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded bg-stone-100 overflow-hidden flex items-center justify-center shrink-0 border border-stone-200">
                    {part.imageUrl ? <img src={part.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-stone-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 text-xs truncate">{part.name}</p>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-[10px] text-stone-500">{formatCurrency(part.price)}</span>
                      <Plus size={14} className="text-stone-300 group-hover:text-amber-600" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orçamento central */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm min-h-[500px] flex flex-col">
          <input
            type="text"
            placeholder="Nome do Orçamento / Cliente"
            className="w-full text-2xl font-bold bg-stone-800 text-white placeholder-stone-500 border-b-2 border-amber-500 rounded-t-lg px-4 py-3 outline-none mb-6 transition-all"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
          />

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {selectedItems.length > 0 ? selectedItems.map(item => {
              const part = catalog.find(p => p.id === item.partId);
              if (!part) return null;
              return (
                <div key={item.partId} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="w-10 h-10 rounded bg-white border border-stone-200 overflow-hidden shrink-0">
                    {part.imageUrl ? <img src={part.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="text-stone-200 w-full h-full p-2" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 truncate text-sm">{part.name}</p>
                    <div className="flex gap-4">
                      <p className="text-[10px] text-stone-400 font-mono">Custo: {formatCurrency(part.purchasePrice * (item.quantity || 0))}</p>
                      <p className="text-[10px] text-stone-600 font-bold">Venda: {formatCurrency(part.price * (item.quantity || 0))}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-stone-200 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.partId, -1)} className="p-1 hover:text-amber-600 transition-colors" title="Diminuir">
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        className="w-14 text-center font-bold text-xs bg-stone-800 text-white rounded border border-stone-700 outline-none focus:ring-1 focus:ring-amber-500 py-1 mx-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) => setQuantity(item.partId, e.target.value)}
                        onBlur={() => {
                          if (!item.quantity || item.quantity < 0.1) updateQuantity(item.partId, 0.1 - (item.quantity || 0));
                        }}
                      />
                      <button onClick={() => updateQuantity(item.partId, 1)} className="p-1 hover:text-amber-600 transition-colors" title="Aumentar">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.partId)} className="text-stone-300 hover:text-red-500 p-1.5 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-300 gap-4 py-20">
                <Calculator size={48} strokeWidth={1} />
                <p className="text-center italic text-sm">Adicione peças do catálogo para construir o orçamento.</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <p className="text-xs font-bold text-stone-400 uppercase mb-1">Custo Total Matérias</p>
                <p className="text-lg font-bold text-stone-700">{formatCurrency(finance.totalCost)}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Lucro Bruto</p>
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(totalProfit)}</p>
              </div>
              <div className="bg-amber-600 p-4 rounded-xl shadow-lg shadow-amber-100 text-white">
                <p className="text-xs font-bold text-amber-100 uppercase mb-1">Preço de Venda Final</p>
                <p className="text-2xl font-black">{formatCurrency(finance.totalSale)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <TrendingUp size={18} />
                <span>Margem de Lucro: {profitMargin.toFixed(1)}%</span>
              </div>
              <button
                disabled={!projectName || selectedItems.length === 0}
                onClick={handleSave}
                className="bg-stone-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-stone-800 transition-all disabled:opacity-50"
              >
                Guardar em Projetos Concluídos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderView;
