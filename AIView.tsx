
import React, { useState, useMemo } from 'react';
import { Part } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Package, Wand2, Loader2, ArrowRight, Home, Banknote, TrendingUp, Calculator, Info, CheckCircle2, Euro } from 'lucide-react';
import { formatCurrency } from '../constants';

interface SuggestionItem {
  partId: string;
  quantity: number;
  usage: string;
}

interface Idea {
  title: string;
  summary: string;
  description: string;
  suggestedItems: SuggestionItem[];
}

interface AIViewProps {
  parts: Part[];
}

const AIView: React.FC<AIViewProps> = ({ parts }) => {
  const [selectedParts, setSelectedParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState<number | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const togglePart = (part: Part) => {
    setSelectedParts(prev => 
      prev.find(p => p.id === part.id) 
        ? prev.filter(p => p.id !== part.id) 
        : [...prev, part]
    );
  };

  const generateIdeas = async () => {
    if (selectedParts.length === 0) return;
    setLoading(true);
    setGeneratedImageUrl(null);
    setIdeas([]);
    setSelectedIdeaIndex(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const partsList = selectedParts.map(p => `ID: ${p.id} - ${p.name} (${p.category})`).join(', ');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Aja como um mestre marceneiro e designer de interiores de luxo. 
                   Com base nestas peças disponíveis: ${partsList}, sugira 3 projetos de móveis sofisticados.
                   
                   Para cada projeto, você deve:
                   1. Criar um título atraente.
                   2. Fazer um resumo curto para o card.
                   3. Escrever uma DESCRIÇÃO DETALHADA do produto final para o cliente.
                   4. Estimar a QUANTIDADE e explicar exatamente ONDE cada material será usado (campo 'usage').
                   
                   Responda APENAS em JSON puro com este formato:
                   [
                     {
                       "title": "Nome do Projeto",
                       "summary": "Resumo comercial curto",
                       "description": "Descrição detalhada do móvel, estilo e proposta de valor.",
                       "suggestedItems": [
                         {"partId": "ID_DA_PECA", "quantity": 2.5, "usage": "Explicação de onde este material é usado no móvel"}
                       ]
                     }
                   ]`,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || "[]");
      setIdeas(data);
    } catch (error) {
      console.error("Erro na IA:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateVisual = async (index: number) => {
    setSelectedIdeaIndex(index);
    setLoading(true);
    const idea = ideas[index];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Professional high-end architectural photo of: ${idea.title}. 
                      Detailed Product Description: ${idea.description}. 
                      Materials palette: ${selectedParts.map(p => p.name).join(', ')}. 
                      Style: Modern luxury, clean lines, impeccable finish, studio lighting, 8k, realistic wood and metal textures.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para calcular o orçamento de uma ideia específica
  const calculateIdeaBudget = (idea: Idea) => {
    let totalCost = 0;
    let totalSale = 0;

    idea.suggestedItems.forEach(item => {
      const part = parts.find(p => p.id === item.partId);
      if (part) {
        totalCost += part.purchasePrice * item.quantity;
        totalSale += part.price * item.quantity;
      }
    });

    const profit = totalSale - totalCost;
    const margin = totalSale > 0 ? (profit / totalSale) * 100 : 0;

    return { totalCost, totalSale, profit, margin };
  };

  const selectedWeightedBudget = useMemo(() => {
    if (selectedIdeaIndex === null || !ideas[selectedIdeaIndex]) return null;
    return calculateIdeaBudget(ideas[selectedIdeaIndex]);
  }, [selectedIdeaIndex, ideas, parts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      {/* Coluna de Seleção */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-purple-600" size={20} />
            <h3 className="font-bold text-stone-800">Materiais para Design</h3>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {parts.map(part => (
              <button 
                key={part.id}
                onClick={() => togglePart(part)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  selectedParts.find(p => p.id === part.id) 
                    ? 'border-purple-500 bg-purple-50 shadow-sm' 
                    : 'border-stone-100 hover:border-stone-300'
                }`}
              >
                <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-400 shrink-0">
                  {part.category[0]}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-bold text-stone-800 truncate">{part.name}</p>
                  <p className="text-[9px] text-stone-400 uppercase tracking-tighter">{part.category}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            disabled={selectedParts.length === 0 || loading}
            onClick={generateIdeas}
            className="w-full mt-6 bg-stone-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-all disabled:opacity-50 shadow-lg shadow-stone-200"
          >
            {loading && !ideas.length ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            Projetar Ideias
          </button>
        </div>
      </div>

      {/* Coluna de Resultados */}
      <div className="lg:col-span-8 space-y-6">
        {!ideas.length && !loading && (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-stone-200 text-stone-300 p-12 text-center">
            <Sparkles size={64} strokeWidth={1} className="mb-4 text-purple-100" />
            <h4 className="text-lg font-bold text-stone-400">Design Inteligente JP</h4>
            <p className="text-sm max-w-sm mt-2 italic">Selecione os materiais à esquerda e a IA irá criar conceitos de mobiliário prontos a vender, com orçamentos ponderados imediatos.</p>
          </div>
        )}

        {loading && !generatedImageUrl && (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-2xl border border-stone-200 shadow-inner">
            <Loader2 className="animate-spin text-purple-600 mb-4" size={48} />
            <p className="text-stone-500 font-medium animate-pulse">A IA está a calcular orçamentos e a redigir projetos...</p>
          </div>
        )}

        {ideas.length > 0 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ideas.map((idea, i) => {
                const budget = calculateIdeaBudget(idea);
                return (
                  <button
                    key={i}
                    onClick={() => generateVisual(i)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      selectedIdeaIndex === i ? 'bg-purple-600 text-white shadow-xl scale-105 z-10' : 'bg-white border-stone-200 hover:border-purple-300'
                    }`}
                  >
                    {/* Badge de Preço Imediato */}
                    <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black rounded-bl-lg ${
                      selectedIdeaIndex === i ? 'bg-purple-800 text-white' : 'bg-stone-100 text-stone-600 group-hover:bg-purple-50 group-hover:text-purple-600'
                    }`}>
                      {formatCurrency(budget.totalSale)}
                    </div>

                    <div className="flex justify-between items-start mb-2 mt-2">
                      <h4 className="font-bold text-xs uppercase tracking-tight leading-tight pr-8">{idea.title}</h4>
                    </div>
                    
                    <p className={`text-[10px] mb-4 line-clamp-2 ${selectedIdeaIndex === i ? 'text-purple-100' : 'text-stone-500'}`}>
                      {idea.summary}
                    </p>

                    <div className="flex items-center justify-between border-t pt-3 border-black/5">
                       <div className="flex items-center gap-1">
                          <TrendingUp size={10} className={selectedIdeaIndex === i ? 'text-white' : 'text-emerald-500'} />
                          <span className="text-[9px] font-bold">{budget.margin.toFixed(0)}% Lucro</span>
                       </div>
                       <ArrowRight size={12} className={selectedIdeaIndex === i ? 'text-white' : 'text-purple-400'} />
                    </div>
                  </button>
                );
              })}
            </div>

            {generatedImageUrl && selectedWeightedBudget && (
              <div className="space-y-6 animate-in zoom-in duration-500">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-900 group mb-6">
                    <img src={generatedImageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Preview IA" />
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2">
                      <Sparkles size={12} className="text-amber-400" /> CONCEITO EXCLUSIVO
                    </div>
                  </div>

                  {/* Descrição do Produto */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 text-stone-800 font-bold mb-3 border-b border-stone-100 pb-2">
                      <Info size={18} className="text-purple-600" />
                      <h3>Descrição do Produto</h3>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed italic">
                      "{ideas[selectedIdeaIndex!].description}"
                    </p>
                  </div>

                  {/* Detalhes de Utilização dos Materiais */}
                  <div>
                    <div className="flex items-center gap-2 text-stone-800 font-bold mb-4">
                      <Package size={18} className="text-amber-600" />
                      <h3>Mapa de Materiais e Aplicação</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ideas[selectedIdeaIndex!].suggestedItems.map((item, idx) => {
                        const p = parts.find(part => part.id === item.partId);
                        return (
                          <div key={idx} className="flex gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-500">
                              {item.quantity}x
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-800 truncate">{p?.name}</p>
                              <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                                <span className="text-purple-600 font-bold uppercase text-[8px]">Aplicação:</span> {item.usage}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Painel de Orçamento Ponderado */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 text-stone-400 mb-1">
                      <Package size={14} />
                      <span className="text-[10px] font-bold uppercase">Custo Produção</span>
                    </div>
                    <p className="text-lg font-black text-stone-700">{formatCurrency(selectedWeightedBudget.totalCost)}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-500 mb-1">
                      <TrendingUp size={14} />
                      <span className="text-[10px] font-bold uppercase">Margem Lucro</span>
                    </div>
                    <p className="text-lg font-black text-emerald-600">+{formatCurrency(selectedWeightedBudget.profit)}</p>
                  </div>

                  <div className="md:col-span-2 bg-stone-900 p-4 rounded-xl shadow-lg border-l-4 border-amber-500">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-amber-500">
                        <Banknote size={14} />
                        <span className="text-[10px] font-bold uppercase">Sugestão de Venda (Ponderada)</span>
                      </div>
                      <span className="bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{selectedWeightedBudget.margin.toFixed(0)}% MARGEM</span>
                    </div>
                    <p className="text-2xl font-black text-white">{formatCurrency(selectedWeightedBudget.totalSale)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-stone-100 p-6 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-4 text-stone-500">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                    <div>
                      <p className="text-xs font-bold text-stone-800 uppercase">Projeto Pronto para Apresentação</p>
                      <p className="text-[10px]">Pode guardar este conceito ou partilhar a imagem com o cliente.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="bg-white text-stone-900 border border-stone-200 px-6 py-2 rounded-lg text-xs font-bold hover:bg-stone-50 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Home size={14} /> Imprimir Orçamento IA
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIView;
