<script lang="ts">
  import type { PageData } from './$types';
  import ToolCard from '$lib/ToolCard.svelte';

  export let data: PageData;
</script>

<svelte:head>
  <title>DXVIIE · Tools</title>
</svelte:head>

<div class="page">
  <header>
    <span class="logo">DXVIIE<span class="sep"> / </span>TOOLS</span>
    <span class="subtitle">generative tools for the analogue world</span>
    <div class="header-right">
      <a href="https://d17e.dev" target="_blank" rel="noopener noreferrer" class="badge link">d17e.dev</a>
      <a href="https://github.com/dxviie/tools" target="_blank" rel="noopener noreferrer" class="badge link">↗ github</a>
      <span class="badge">{data.tools.length} tool{data.tools.length !== 1 ? 's' : ''}</span>
    </div>
  </header>

  <main>
    <div class="about">
      <p>
        Self-contained single-file HTML+JS tools built to solve specific problems.
        Each tool is a standalone <code>.html</code> file — no build step, no dependencies, runs anywhere.
        Inspired by <a href="https://tools.simonwillison.net/" target="_blank" rel="noopener noreferrer">Simon Willison's approach</a>
        to <a href="https://simonwillison.net/2025/Dec/10/html-tools/" target="_blank" rel="noopener noreferrer">HTML tools</a>.
      </p>
    </div>

    <div class="section-header">
      <span class="section-label">tools</span>
      <span class="section-count">{data.tools.length}</span>
      <div class="section-rule"></div>
    </div>

    {#if data.tools.length === 0}
      <div class="empty">
        <p>No tools registered yet.</p>
        <p class="hint">Drop an <code>.html</code> file into <code>static/tools/</code> then run <code>npm run register-tools</code></p>
      </div>
    {:else}
      <div class="grid">
        {#each data.tools as tool}
          <ToolCard {tool} />
        {/each}
      </div>
    {/if}

    <footer>
      <span>open source · <a href="https://github.com/dxviie/tools" target="_blank" rel="noopener noreferrer">github.com/dxviie/tools</a></span>
    </footer>
  </main>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* ── Header ── */
  header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--panel);
    flex-shrink: 0;
  }

  .logo {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .2em;
    color: var(--accent);
    text-transform: uppercase;
  }

  .sep { color: var(--text-muted); margin: 0 2px; }

  .subtitle {
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: .05em;
  }

  .header-right {
    margin-left: auto;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .badge {
    font-size: 10px;
    padding: 2px 8px;
    border: 1px solid var(--border-hi);
    color: var(--text-dim);
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .badge.link {
    text-decoration: none;
    transition: border-color .12s, color .12s;
  }

  .badge.link:hover {
    border-color: var(--accent-dim);
    color: var(--text);
  }

  /* ── Main ── */
  main {
    padding: 28px 24px 40px;
    flex: 1;
    max-width: 1200px;
    width: 100%;
  }

  /* ── About ── */
  .about {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }

  .about p {
    font-size: 11px;
    color: var(--text-dim);
    line-height: 1.8;
    letter-spacing: .03em;
    max-width: 680px;
  }

  .about a {
    color: var(--text-dim);
    text-decoration: underline;
    text-decoration-color: var(--border-hi);
    text-underline-offset: 3px;
    transition: color .12s, text-decoration-color .12s;
  }

  .about a:hover {
    color: var(--accent);
    text-decoration-color: var(--accent-dim);
  }

  .about code {
    color: var(--text);
    background: var(--panel);
    padding: 0 4px;
  }

  /* ── Section header ── */
  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .section-label {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: var(--text-dim);
    flex-shrink: 0;
  }

  .section-count {
    font-size: 9px;
    color: var(--accent);
    font-weight: 500;
    flex-shrink: 0;
  }

  .section-rule {
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── Grid ── */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
  }

  /* ── Empty state ── */
  .empty {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 32px 0;
    color: var(--text-dim);
    font-size: 12px;
  }

  .empty .hint {
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1.7;
  }

  .empty code, footer code {
    color: var(--text-dim);
    background: var(--panel);
    padding: 0 4px;
  }

  /* ── Footer ── */
  footer {
    margin-top: 20px;
    font-size: 10px;
    color: var(--text-muted);
    letter-spacing: .04em;
  }

  footer a {
    color: var(--text-muted);
    text-decoration: none;
    transition: color .12s;
  }

  footer a:hover {
    color: var(--text-dim);
  }
</style>
