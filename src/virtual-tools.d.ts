declare module 'virtual:tools' {
  export interface Tool {
    name: string;
    slug: string;
    description: string;
    category: string;
    tags: string[];
    filename: string;
  }

  export const tools: Tool[];
}
