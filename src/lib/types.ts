export interface Tool {
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  filename: string;
}

export interface Category {
  id: string;
  label: string;
  tagline: string;
  color: string;
  icon: string;
}
