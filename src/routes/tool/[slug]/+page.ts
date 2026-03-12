import { tools } from 'virtual:tools';
import { error } from '@sveltejs/kit';

export const entries = () => tools.map(t => ({ slug: t.slug }));

export const load = ({ params }: { params: { slug: string } }) => {
  const tool = tools.find(t => t.slug === params.slug);
  if (!tool) throw error(404, `Tool "${params.slug}" not found`);
  return { tool };
};
