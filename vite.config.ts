import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

function toolsManifestPlugin(): Plugin {
  const VIRTUAL_ID = 'virtual:tools';
  const RESOLVED_ID = '\0' + VIRTUAL_ID;

  function scanTools(root: string) {
    const dir = join(root, 'static', 'tools');
    if (!existsSync(dir)) return [];

    return readdirSync(dir)
      .filter(f => extname(f) === '.html')
      .sort()
      .flatMap(filename => {
        const content = readFileSync(join(dir, filename), 'utf8');
        const match = content.match(/<!--\s*tool-meta:\s*(\{[\s\S]*?\})\s*-->/);
        if (!match) return [];
        try {
          const meta = JSON.parse(match[1]);
          return [{
            name:        meta.name        ?? basename(filename, '.html'),
            slug:        meta.slug        ?? basename(filename, '.html'),
            description: meta.description ?? '',
            tags:        meta.tags        ?? [],
            filename
          }];
        } catch {
          return [];
        }
      });
  }

  return {
    name: 'tools-manifest',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id === RESOLVED_ID) {
        const tools = scanTools(process.cwd());
        return `export const tools = ${JSON.stringify(tools, null, 2)};`;
      }
    },
    configureServer(server) {
      const dir = join(process.cwd(), 'static', 'tools');
      server.watcher.add(dir);
      server.watcher.on('all', (event, path) => {
        if (!['add', 'change', 'unlink'].includes(event)) return;
        if (path.startsWith(dir) && path.endsWith('.html')) {
          const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
          if (mod) server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [toolsManifestPlugin(), sveltekit()]
});
