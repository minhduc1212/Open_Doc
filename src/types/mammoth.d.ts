declare module 'mammoth' {
  export interface Result {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }
  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string },
    options?: any
  ): Promise<Result>;
  export function extractRawText(
    input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string },
    options?: any
  ): Promise<Result>;
}
