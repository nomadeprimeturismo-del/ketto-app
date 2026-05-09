export type UserRole = 'passageiro' | 'motorista' | 'admin';
export type DriverStatus = 'pendente' | 'em_analise' | 'aprovado' | 'reprovado' | 'bloqueado';
export type RideStatus = 'solicitada' | 'procurando_motorista' | 'aceita' | 'motorista_chegando' | 'em_andamento' | 'finalizada' | 'cancelada';
export type VehicleType = 'carro' | 'moto' | 'outro';
export type PaymentMethod = 'dinheiro' | 'pix' | 'credito' | 'debito' | 'kettopay';
export type RideCategory = 'economico' | 'conforto' | 'moto' | 'entrega';

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  data_nascimento: string;
  tipo_usuario: UserRole;
  foto_perfil?: string;
  pontos?: number;
  clubPoints?: number;
  totalSpent?: number;
  clubLevel?: ClubKettoLevel;
  walletId?: string;
  kettopayBalance?: number;
  saldo?: number;
  corridas_hoje?: number;
  ultima_corrida_data?: string;
  nivel?: string;
  criado_em: any;
}

export type ClubKettoLevel = 'BRONZE' | 'PRATA' | 'OURO' | 'DIAMANTE' | 'BLACK';

export interface ClubKetto {
  userId: string;
  totalPoints: number;
  totalSpent: number;
  currentLevel: ClubKettoLevel;
  cashbackPercent: number;
  nextLevel: ClubKettoLevel | 'MAX';
  nextLevelPoints: number;
  createdAt: any;
  updatedAt: any;
}

export interface DriverProfile {
  uid: string;
  nome?: string;
  email?: string;
  telefone?: string;
  cnh: string;
  documento_veiculo: string;
  placa: string;
  marca_veiculo: string;
  modelo_veiculo: string;
  cor_veiculo: string;
  ano_veiculo: string;
  tipo_veiculo: VehicleType;
  chave_pix: string;
  status_aprovacao: DriverStatus;
  online: boolean;
  latitude?: number;
  longitude?: number;
  latitude_atual?: number; // Keep for safety during transition
  longitude_atual?: number; // Keep for safety during transition
  avaliacao_media: number;
  total_ganhos?: number;
  total_corridas?: number;
  saldo?: number;
}

export interface Ride {
  id: string;
  passageiro_id: string;
  motorista_id?: string;
  origem: string;
  destino: string;
  latitude_origem: number;
  longitude_origem: number;
  latitude_destino: number;
  longitude_destino: number;
  distancia_km: number;
  tempo_estimado: number;
  valor_estimado: number;
  valor_final?: number;
  forma_pagamento: PaymentMethod;
  categoria: RideCategory;
  status: RideStatus;
  criado_em: any;
  finalizado_em?: any;
  app_commission?: number;
  driver_gain?: number;
  pagamento_confirmado?: boolean;
  pointsAdded?: boolean;
  cashbackAdded?: boolean;
  cashbackAmount?: number;
  updatedAt?: any;
}

export type WalletStatus = 'active' | 'blocked';
export type TransactionType = 'deposit' | 'ride_payment' | 'cashback' | 'transfer';
export type DepositStatus = 'pending' | 'paid' | 'expired' | 'failed';

export interface Wallet {
  userId: string;
  balance: number;
  cashbackBalance: number;
  totalAdded: number;
  totalCashbackReceived: number;
  status: WalletStatus;
  createdAt: any;
  updatedAt: any;
}

export interface WalletDeposit {
  id?: string;
  userId: string;
  walletId: string;
  amount: number;
  paymentMethod: 'pix';
  status: DepositStatus;
  pixQrCode?: string;
  pixCopyPaste?: string;
  externalPaymentId?: string;
  createdAt: any;
  paidAt?: any;
}

export interface WalletTransaction {
  id?: string;
  userId: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: string;
  referenceId?: string;
  createdAt: any;
}

export interface PointsHistory {
  id?: string;
  userId: string;
  rideId: string;
  points: number;
  amountSpent: number;
  type: "ride_completed";
  createdAt: any;
}
