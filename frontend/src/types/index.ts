export type UserRole =
  | 'ADMIN'
  | 'GERENCIAMENTO'
  | 'PCP'
  | 'ALMOXARIFADO'
  | 'PREPARACAO'
  | 'PRODUCAO'
  | 'SECADORA'
  | 'DESTRINCHAGEM'
  | 'ENROLAGEM'
  | 'QUALIDADE'
  | 'LABORATORIO'
  | 'PESAGEM'
  | 'LISTA_SAIDA'
  | 'FABRIC_QUALITY';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ProductionOrder {
  id: number;
  op: string;
  produto: string;
  cliente: string;
  quantidade: number;
  fibra?: string;
  cor?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  active: boolean;
}

export interface Fibra {
  id: number;
  name: string;
}

export interface Transportadora {
  id: number;
  name: string;
  cnpj?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  total?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}
