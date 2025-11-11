export interface ExportStrategy {
  export(data: Record<string, unknown>[]): Promise<Buffer>;
  getContentType(): string;
}
