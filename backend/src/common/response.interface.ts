export interface Response<T = any> {
  statusCode: number;
  message: string;
  data: T | null;
}