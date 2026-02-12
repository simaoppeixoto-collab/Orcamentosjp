
export interface Part {
  id: string;
  name: string;
  purchasePrice: number;
  price: number;
  category: string;
  unit: string;
  imageUrl?: string;
}

export interface ProjectItem {
  partId: string;
  quantity: number;
}

export interface Project {
  id: string;
  name: string;
  items: ProjectItem[];
  createdAt: number;
}

export enum View {
  DASHBOARD = 'dashboard',
  CATALOG = 'catalog',
  PROJECT_BUILDER = 'builder',
  AI_GEN = 'ai_gen'
}
