
import { Part } from './types';

export const INITIAL_PARTS: Part[] = [
  { id: '1', name: 'Placa MDF 18mm Branca', purchasePrice: 45.00, price: 85.50, category: 'Madeira', unit: 'un' },
  { id: '2', name: 'Dobradiça Caneco 35mm', purchasePrice: 1.80, price: 4.20, category: 'Ferragem', unit: 'un' },
  { id: '3', name: 'Puxador Alumínio 128mm', purchasePrice: 2.50, price: 6.50, category: 'Acessório', unit: 'un' },
  { id: '4', name: 'Corrediça Telescópica 450mm', purchasePrice: 5.50, price: 12.80, category: 'Ferragem', unit: 'par' },
  { id: '5', name: 'Parafuso 4.0x40 (Cento)', purchasePrice: 3.20, price: 8.00, category: 'Consumível', unit: 'cento' },
  { id: '6', name: 'Cola de Contato 1L', purchasePrice: 12.00, price: 22.50, category: 'Químico', unit: 'un' },
  { id: '7', name: 'Fita de Borda PVC 22mm (Metro)', purchasePrice: 0.45, price: 1.15, category: 'Acabamento', unit: 'm' },
];

export const CATEGORIES = ['Madeira', 'Ferragem', 'Acessório', 'Consumível', 'Químico', 'Acabamento', 'Outros'];

export const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
};
