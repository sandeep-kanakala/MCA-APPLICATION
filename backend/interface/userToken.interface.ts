export interface IUserTokenPayload {
  userId: string;
  email: string;
  tenantId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  iat: number;
  exp: number;
}
