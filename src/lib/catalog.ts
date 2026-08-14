import categoriesData from '$lib/categories.json';
import type { Category, Tool } from '$lib/types';

/** Canonical category order — drives the landing page and the README. */
export const categories: Category[] = categoriesData.categories;

const byId = new Map(categories.map(c => [c.id, c]));

export function getCategory(id: string): Category {
  return byId.get(id) ?? (byId.get('misc') as Category);
}

export interface CategoryGroup {
  category: Category;
  tools: Tool[];
}

/** Group tools by category, in canonical order, dropping empty categories. */
export function groupByCategory(tools: Tool[]): CategoryGroup[] {
  return categories
    .map(category => ({
      category,
      tools: tools
        .filter(t => getCategory(t.category).id === category.id)
        .sort((a, b) => a.name.localeCompare(b.name))
    }))
    .filter(g => g.tools.length > 0);
}

/** Case-insensitive match against name, description, tags and category label. */
export function matchesQuery(tool: Tool, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    tool.name,
    tool.description,
    getCategory(tool.category).label,
    ...tool.tags
  ]
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).every(part => haystack.includes(part));
}
