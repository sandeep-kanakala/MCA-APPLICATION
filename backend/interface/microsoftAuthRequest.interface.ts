import { Request } from 'express';

export interface MicrosoftAuthRequest extends Request {
  user:
    | {
        access_token: string;
      }
    | {
        error: string;
        message: string;
      };
}
