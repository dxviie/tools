import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    // Emit the SPA shell as 404.html. Without it Cloudflare Pages answers any
    // unmatched path with index.html and a 200 — including a hashed asset that
    // is missing for the moment a deploy goes live. The browser then caches
    // 60 kB of HTML under a .js URL for as long as the asset policy says, and
    // every later load replays it as "expected a module, got text/html". A
    // 404.html makes those misses a real 404 instead.
    adapter: adapter({ fallback: '404.html' }),
    // 404.html is served at whatever URL was missed, so the relative asset
    // paths SvelteKit emits by default ("./_app/…") would resolve against that
    // URL and never load. The site is served from the domain root and already
    // links its tool files absolutely, so absolute paths cost nothing here.
    paths: { relative: false }
  }
};
