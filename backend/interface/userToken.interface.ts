export interface IUserTokenPayload {
  id: string;
  email: string;
  tenantId: string;
  iat: number;
  exp: number;
}
