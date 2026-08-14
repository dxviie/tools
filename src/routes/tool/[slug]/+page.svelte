<script lang="ts">
  import type { PageData } from './$types';
  import ToolIcon from '$lib/ToolIcon.svelte';
  import { getCategory } from '$lib/catalog';

  export let data: PageData;

  $: category = getCategory(data.tool.category);
</script>

<svelte:head>
  <title>{data.tool.name} · DXVIIE Tools</title>
  {#if data.tool.description}
    <meta name="description" content={data.tool.description} />
  {/if}
</svelte:head>

<div class="page" style="--cat: {category.color}">
  <header>
    <a href="/" class="back" title="All tools">←</a>
    <div class="vr"></div>
    <a href="/" class="logo">DXVIIE<span class="sep"> / </span>TOOLS</a>
    <span class="sep"> / </span>
    <span class="tool-ident">
      <span class="tool-glyph"><ToolIcon seed={data.tool.slug} family={category.icon} size={18} /></span>
      <span class="tool-name">{data.tool.name}</span>
    </span>
    <div class="header-right">
      <span class="badge cat-badge">{category.label}</span>
      {#each data.tool.tags as tag}
        <span class="badge tag-badge">{tag}</span>
      {/each}
      <a
        href="/tools/{data.tool.filename}"
        target="_blank"
        rel="noopener noreferrer"
        class="badge open-link"
        title="Open standalone"
      >↗ standalone</a>
    </div>
  </header>

  <iframe
    src="/tools/{data.tool.filename}"
    title={data.tool.name}
  ></iframe>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  /* ── Header ── */
  header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--border);
    background: var(--panel);
    flex-shrink: 0;
  }

  .back {
    font-size: 14px;
    color: var(--text-dim);
    text-decoration: none;
    line-height: 1;
    transition: color .12s;
    padding: 2px 4px;
  }

  .back:hover { color: var(--accent); }

  .vr {
    width: 1px;
    height: 14px;
    background: var(--border-hi);
    flex-shrink: 0;
  }

  .logo {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .18em;
    color: var(--accent);
    text-transform: uppercase;
    text-decoration: none;
  }

  .sep { color: var(--text-muted); }

  .tool-ident {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .tool-glyph {
    color: var(--cat);
    display: flex;
    flex-shrink: 0;
  }

  .tool-name {
    font-size: 11px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-right {
    margin-left: auto;
    display: flex;
    gap: 6px;
    align-items: center;
    flex-shrink: 0;
  }

  .badge {
    font-size: 10px;
    padding: 2px 8px;
    border: 1px solid var(--border-hi);
    color: var(--text-dim);
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .cat-badge {
    border-color: color-mix(in srgb, var(--cat) 45%, var(--border-hi));
    color: var(--cat);
  }

  .open-link {
    text-decoration: none;
    transition: border-color .12s, color .12s;
  }

  .open-link:hover {
    border-color: var(--accent-dim);
    color: var(--text);
  }

  @media (max-width: 860px) {
    .tag-badge { display: none; }
  }

  /* ── iframe ── */
  iframe {
    flex: 1;
    width: 100%;
    border: none;
    display: block;
    min-height: 0;
  }
</style>
