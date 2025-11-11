import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { IUserTokenPayload } from '~/interface';
import { User } from '@prisma/client';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { KEYVAULT_NAME } from '@/config/constants';
import { KEYVAULT_URL } from '@/config/urls';

export const AccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request: Request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;

    if (!authHeader || typeof authHeader !== 'string') return undefined;

    return authHeader.replace('Bearer ', '');
  },
);

export function hash(stringToHash: string): string {
  return crypto.createHash('md5').update(stringToHash).digest('hex');
}

export class passwordEncoder {
  public static async hashPassword(plainPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    return hashedPassword;
  }
  public static async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export function isIUserTokenPayload(
  user: IUserTokenPayload | User,
): user is IUserTokenPayload {
  return (user as IUserTokenPayload).id !== undefined;
}

export async function getSecret(secretName: string): Promise<string | null> {
  try {
    const vaultName = KEYVAULT_NAME;
    if (!vaultName) {
      throw new Error('Environment variable AZURE_KEY_VAULT_NAME is not set');
    }
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(KEYVAULT_URL, credential);

    const secret = await client.getSecret(secretName);
    return secret.value ?? null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error retrieving secret "${secretName}": ${message}`);
    return null;
  }
}

type RelationConnect = { connect: { id: string | number } };

//this helper function is included to build optional relations dynamically for all  modules
export function buildRelations<
  T extends Record<string, string | number | undefined>,
>(data: T, mapping: Record<keyof T, string>): Record<string, RelationConnect> {
  return Object.entries(mapping).reduce(
    (acc, [key, relation]) => {
      const id = data[key as keyof T];
      if (id) acc[relation] = { connect: { id } };
      return acc;
    },
    {} as Record<string, RelationConnect>,
  );
}

//developed of future reference in building relations
export function pickKeys<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      if (obj[key] !== undefined) {
        acc[key] = obj[key];
        delete obj[key];
      }
      return acc;
    },
    {} as Pick<T, K>,
  );
}

export function safeJsonParse<T>(value: string | null | undefined): T | null {
  try {
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export function extractRelationFromMessage(message: string): string | null {
  const match = message.match(/No\s+'(\w+)'/);
  return match ? match[1] : null;
}

export function toBoolean(val: string) {
  return val === 'true' ? true : false;
}

export function extractRelationDetailFromMessage(
  message: string,
): string | null {
  const match = message.match(/relation\s+'(\w+)'/i);
  return match ? match[1] : null;
}

export function formatEntityName(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
}
