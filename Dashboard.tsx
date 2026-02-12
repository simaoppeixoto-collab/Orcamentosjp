
import React from 'react';
import { Project, Part, View } from '../types';
import { Package, Hammer, TrendingUp, Clock, FileDown, Banknote, Trash2 } from 'lucide-react';
import { formatCurrency } from '../constants';

interface DashboardProps {
  projects: Project[];
  parts: Part[];
  setView: (view: View) => void;
  onDeleteProject?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, parts, setView, onDeleteProject }) => {
  const getProjectTotals = (project: Project) => {
    return project.items.reduce((acc, item) => {
      const part = parts.find(p => p.id === item.partId);
      if (part) {
        acc.cost += part.purchasePrice * item.quantity;
        acc.sale += part.price * item.quantity;
      }
      return acc;
    }, { cost: 0, sale: 0 });
  };

  const totalRevenue = projects.reduce((sum, p) => sum + getProjectTotals(p).sale, 0);
  const totalCost = projects.reduce((sum, p) => sum + getProjectTotals(p).cost, 0);
  const totalProfit = totalRevenue - totalCost;

  const exportToCSV = (project: Project) => {
    const { sale, cost } = getProjectTotals(project);
    const profit = sale - cost;
    const margin = sale > 0 ? (profit / sale) * 100 : 0;

    // Cabeçalho e Metadados do Projeto
    let csvContent = "Orçamentos JP - Relatório de Projeto\n";
    csvContent += `Projeto:;${project.name}\n`;
    csvContent += `Data:;${new Date(project.createdAt).toLocaleDateString('pt-PT')}\n\n`;

    // Cabeçalho da Tabela de Itens
    csvContent += "PEÇA;CATEGORIA;QUANTIDADE;UNIDADE;PREÇO UNIT. (VENDA);SUBTOTAL (VENDA)\n";

    // Itens
    project.items.forEach(item => {
      const part = parts.find(p => p.id === item.partId);
      if (part) {
        const subtotal = part.price * item.quantity;
        csvContent += `${part.name};${part.category};${item.quantity};${part.unit};${part.price.toFixed(2)}€;${subtotal.toFixed(2)}€\n`;
      }
    });

    // Totais Finais
    csvContent += "\nRESUMO FINANCEIRO\n";
    csvContent += `CUSTO TOTAL DE MATERIAIS:;${cost.toFixed(2)}€\n`;
    csvContent += `VALOR TOTAL DO ORÇAMENTO:;${sale.toFixed(2)}€\n`;
    csvContent += `LUCRO BRUTO ESTIMADO:;${profit.toFixed(2)}€\n`;
    csvContent += `MARGEM DE LUCRO:;${margin.toFixed(1)}%\n`;

    // Para o Excel reconhecer o Português corretamente (UTF-8 com BOM)
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Orcamento_JP_${project.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Volume Orçado Total', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-stone-400', bg: 'bg-stone-50' },
    { label: 'Lucro Acumulado', value: formatCurrency(totalProfit), icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Itens no Catálogo', value: parts.length, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', onClick: () => setView(View.CATALOG) },
    { label: 'Projetos Concluídos', value: projects.length, icon: Hammer, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={stat.onClick}
            className={`bg-white p-6 rounded-2xl border border-stone-200 shadow-sm transition-all ${stat.onClick ? 'cursor-pointer hover:shadow-md hover:border-amber-200' : ''}`}
          >
            <div className={`${stat.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className={stat.color} size={20} />
            </div>
            <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-stone-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Lista de Projetos Concluídos */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-stone-800 font-bold flex items-center gap-2 uppercase text-xs tracking-widest">
            <Clock size={16} className="text-amber-600" />
            Arquivo de Orçamentos
          </h3>
          <button 
            onClick={() => setView(View.PROJECT_BUILDER)}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            Novo Orçamento <TrendingUp size={14} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Nome do Projeto / Cliente</th>
                <th className="px-6 py-4">Peças</th>
                <th className="px-6 py-4">Total Venda</th>
                <th className="px-6 py-4">Lucro</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {projects.length > 0 ? [...projects].reverse().map(project => {
                const { sale, cost } = getProjectTotals(project);
                const profit = sale - cost;
                return (
                  <tr key={project.id} className="hover:bg-stone-50 transition-colors group">
                    <td className="px-6 py-4 text-xs text-stone-400">
                      {new Date(project.createdAt).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-stone-800">{project.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-stone-500">{project.items.length} itens</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-stone-900">{formatCurrency(sale)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-emerald-600">+{formatCurrency(profit)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => exportToCSV(project)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
                        >
                          <FileDown size={14} />
                          Excel
                        </button>
                        {onDeleteProject && (
                          <button 
                            onClick={() => onDeleteProject(project.id)}
                            className="p-1.5 text-stone-200 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-300 italic text-sm">
                    Nenhum orçamento guardado. Comece por criar um novo projeto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
