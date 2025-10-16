import { Request } from 'express';
import { IUserTokenPayload } from './userToken.interface';

export interface RequestWithUser extends Request {
  user: IUserTokenPayload;
}
