export interface IUserTokenPayload {
  userId: string;
  email: string;
  tenantId: string;
  iat: number;
  exp: number;
}
