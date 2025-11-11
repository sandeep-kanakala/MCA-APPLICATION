export interface IUserTokenPayload {
  id: string;
  email: string;
  tenantId: string;
  iat: number;
  exp: number;
}

export interface IUserToken extends IUserTokenPayload {
  roles: {
    id: string;
    name: string;
    permissions: {
      id: string;
      name: string;
    }[];
  }[];
}

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
