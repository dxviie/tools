<script lang="ts">
  import type { PageData } from './$types';
  import ToolCard from '$lib/ToolCard.svelte';
  import HeroField from '$lib/HeroField.svelte';
  import { categories, getCategory, groupByCategory, matchesQuery } from '$lib/catalog';

  export let data: PageData;

  let query = '';
  let activeCategory: string | null = null;
  let searchInput: HTMLInputElement;

  $: queryMatches = data.tools.filter(t => matchesQuery(t, query));
  $: visibleTools = queryMatches.filter(
    t => !activeCategory || getCategory(t.category).id === activeCategory
  );
  $: groups = groupByCategory(visibleTools);
  $: countFor = (id: string) =>
    queryMatches.filter(t => getCategory(t.category).id === id).length;
  $: usedCategories = categories.filter(c => data.tools.some(t => getCategory(t.category).id === c.id));

  function clearSearch() {
    query = '';
    activeCategory = null;
  }

  function onKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
    if (e.key === '/' && !typing) {
      e.preventDefault();
      searchInput?.focus();
    } else if (e.key === 'Escape' && typing) {
      query = '';
      searchInput?.blur();
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />

<svelte:head>
  <title>DXVIIE / TOOLS — generative tools for the analogue world</title>
  <meta
    name="description"
    content="A collection of self-contained single-file HTML tools for pen plotting, camera & vision experiments, and social visuals. No build step, no server — each tool runs anywhere."
  />
</svelte:head>

<div class="page">
  <nav class="topbar">
    <span class="logo">DXVIIE<span class="sep"> / </span>TOOLS</span>
    <div class="topbar-right">
      <a href="https://d17e.dev" target="_blank" rel="noopener noreferrer" class="badge link">d17e.dev</a>
      <a href="https://github.com/dxviie/tools" target="_blank" rel="noopener noreferrer" class="badge link">↗ github</a>
      <span class="badge">{data.tools.length} tool{data.tools.length !== 1 ? 's' : ''}</span>
    </div>
  </nav>

  <section class="hero">
    <HeroField />
    <div class="hero-scrim" aria-hidden="true"></div>
    <div class="hero-inner">
      <h1>Generative tools<br />for the analogue world<span class="cursor" aria-hidden="true"></span></h1>
      <p class="hero-sub">
        {data.tools.length} self-contained, single-file HTML tools for pen plotting, camera experiments
        and social visuals. No build step, no server — every tool is one <code>.html</code> file that runs anywhere.
        Inspired by <a href="https://simonwillison.net/2025/Dec/10/html-tools/" target="_blank" rel="noopener noreferrer">Simon Willison's HTML tools</a>.
      </p>

      <div class="searchbox">
        <svg class="search-glyph" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6" />
          <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <input
          bind:this={searchInput}
          bind:value={query}
          type="search"
          placeholder="search tools — name, tag, tech…"
          aria-label="Search tools"
          autocomplete="off"
          spellcheck="false"
        />
        {#if query}
          <button class="clear" on:click={clearSearch} aria-label="Clear search">×</button>
        {:else}
          <kbd>/</kbd>
        {/if}
      </div>

      <div class="chips" role="group" aria-label="Filter by category">
        <button
          class="chip"
          class:active={activeCategory === null}
          style="--cat: var(--accent)"
          aria-pressed={activeCategory === null}
          on:click={() => (activeCategory = null)}
        >all <span class="chip-count">{queryMatches.length}</span></button>
        {#each usedCategories as cat}
          <button
            class="chip"
            class:active={activeCategory === cat.id}
            style="--cat: {cat.color}"
            aria-pressed={activeCategory === cat.id}
            on:click={() => (activeCategory = activeCategory === cat.id ? null : cat.id)}
          >{cat.label} <span class="chip-count">{countFor(cat.id)}</span></button>
        {/each}
      </div>
    </div>
  </section>

  <main>
    {#if groups.length === 0}
      <div class="empty">
        {#if data.tools.length === 0}
          <p>No tools registered yet.</p>
          <p class="hint">Drop an <code>.html</code> file into <code>static/tools/</code> then run <code>npm run register-tools</code></p>
        {:else}
          <p>No tools match <strong>“{query}”</strong>{#if activeCategory}&nbsp;in {getCategory(activeCategory).label}{/if}.</p>
          <button class="reset" on:click={clearSearch}>clear search</button>
        {/if}
      </div>
    {/if}

    {#each groups as group (group.category.id)}
      <section class="cat" style="--cat: {group.category.color}">
        <header class="cat-head">
          <span class="cat-mark" aria-hidden="true"></span>
          <h2>{group.category.label}</h2>
          <span class="cat-count">{group.tools.length}</span>
          <span class="cat-tagline">{group.category.tagline}</span>
          <span class="cat-rule" aria-hidden="true"></span>
        </header>
        <div class="grid">
          {#each group.tools as tool (tool.slug)}
            <ToolCard {tool} />
          {/each}
        </div>
      </section>
    {/each}
  </main>

  <footer>
    <div class="foot-col foot-brand">
      <span class="logo">DXVIIE<span class="sep"> / </span>TOOLS</span>
      <p>
        Single-file HTML tools — bookmark them, copy them, host them anywhere.
        The SvelteKit shell only adds this landing page and a viewer.
      </p>
    </div>
    <div class="foot-col">
      <span class="foot-label">elsewhere</span>
      <a href="https://d17e.dev" target="_blank" rel="noopener noreferrer">d17e.dev</a>
      <a href="https://github.com/dxviie/tools" target="_blank" rel="noopener noreferrer">github.com/dxviie/tools</a>
      <a href="https://tools.simonwillison.net" target="_blank" rel="noopener noreferrer">tools.simonwillison.net</a>
    </div>
    <div class="foot-col">
      <span class="foot-label">colophon</span>
      <span>open source · MIT</span>
      <span>type: IBM Plex Mono · Hershey · EMS</span>
      <span>icons: generative, seeded per tool</span>
    </div>
  </footer>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* ── Top bar ── */
  .topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 24px;
    border-bottom: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(6px);
  }

  .logo {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .2em;
    color: var(--accent);
    text-transform: uppercase;
  }

  .sep { color: var(--text-muted); margin: 0 2px; }

  .topbar-right {
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

  /* ── Hero ── */
  .hero {
    position: relative;
    border-bottom: 1px solid var(--border);
    background:
      radial-gradient(ellipse 80% 90% at 50% 110%, color-mix(in srgb, var(--accent) 6%, transparent), transparent),
      var(--bg);
    overflow: hidden;
  }

  .hero-scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      100deg,
      color-mix(in srgb, var(--bg) 88%, transparent) 0%,
      color-mix(in srgb, var(--bg) 55%, transparent) 45%,
      transparent 78%
    );
    pointer-events: none;
  }

  .hero-inner {
    position: relative;
    padding: clamp(40px, 6vw, 84px) clamp(20px, 4vw, 56px) clamp(28px, 3.5vw, 48px);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  h1 {
    font-size: clamp(26px, 3.6vw, 46px);
    font-weight: 500;
    line-height: 1.15;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--text);
    max-width: 18em;
  }

  .cursor {
    display: inline-block;
    width: .5em;
    height: .82em;
    margin-left: .18em;
    background: var(--accent);
    vertical-align: baseline;
    transform: translateY(.08em);
    animation: blink 1.2s steps(2, start) infinite;
  }

  @keyframes blink {
    to { visibility: hidden; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cursor { animation: none; }
  }

  .hero-sub {
    font-size: 12px;
    color: var(--text-dim);
    line-height: 1.8;
    letter-spacing: .03em;
    max-width: 560px;
  }

  .hero-sub code {
    color: var(--text);
    background: var(--panel);
    padding: 0 4px;
  }

  .hero-sub a {
    color: var(--text-dim);
    text-decoration: underline;
    text-decoration-color: var(--border-hi);
    text-underline-offset: 3px;
    transition: color .12s, text-decoration-color .12s;
  }

  .hero-sub a:hover {
    color: var(--accent);
    text-decoration-color: var(--accent-dim);
  }

  /* ── Search ── */
  .searchbox {
    position: relative;
    display: flex;
    align-items: center;
    width: min(560px, 100%);
  }

  .search-glyph {
    position: absolute;
    left: 13px;
    width: 15px;
    height: 15px;
    color: var(--text-dim);
    pointer-events: none;
  }

  .searchbox input {
    width: 100%;
    padding: 11px 44px 11px 38px;
    background: var(--input-bg);
    border: 1px solid var(--border-hi);
    color: var(--text);
    font-family: var(--mono);
    font-size: 12.5px;
    letter-spacing: .03em;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
    appearance: none;
    border-radius: 0;
  }

  .searchbox input::-webkit-search-cancel-button { display: none; }

  .searchbox input::placeholder { color: var(--text-muted); }

  .searchbox input:focus {
    border-color: var(--accent-dim);
    box-shadow: 0 0 0 1px var(--accent-dim);
  }

  .searchbox kbd {
    position: absolute;
    right: 12px;
    font-family: var(--mono);
    font-size: 10px;
    color: var(--text-muted);
    border: 1px solid var(--border-hi);
    padding: 1px 6px;
    pointer-events: none;
  }

  .searchbox .clear {
    position: absolute;
    right: 8px;
    background: none;
    border: none;
    color: var(--text-dim);
    font-family: var(--mono);
    font-size: 16px;
    cursor: pointer;
    padding: 2px 8px;
    transition: color .12s;
  }

  .searchbox .clear:hover { color: var(--text); }

  /* ── Category chips ── */
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: .12em;
    text-transform: uppercase;
    padding: 5px 11px;
    background: none;
    border: 1px solid var(--border-hi);
    color: var(--text-dim);
    cursor: pointer;
    transition: border-color .15s, color .15s, background .15s;
  }

  .chip:hover {
    border-color: color-mix(in srgb, var(--cat) 60%, var(--border-hi));
    color: var(--text);
  }

  .chip.active {
    border-color: var(--cat);
    color: var(--cat);
    background: color-mix(in srgb, var(--cat) 10%, transparent);
  }

  .chip-count {
    opacity: .65;
    margin-left: 4px;
  }

  /* ── Main / category sections ── */
  main {
    flex: 1;
    width: 100%;
    padding: clamp(20px, 2.5vw, 36px) clamp(16px, 2.5vw, 40px) clamp(40px, 4vw, 64px);
    display: flex;
    flex-direction: column;
    gap: clamp(32px, 3.5vw, 52px);
  }

  .cat-head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  .cat-mark {
    width: 9px;
    height: 9px;
    background: var(--cat);
    align-self: center;
    flex-shrink: 0;
  }

  .cat-head h2 {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--text);
  }

  .cat-count {
    font-size: 11px;
    color: var(--cat);
    font-weight: 500;
  }

  .cat-tagline {
    font-size: 10.5px;
    color: var(--text-muted);
    letter-spacing: .04em;
  }

  .cat-rule {
    flex: 1;
    height: 1px;
    align-self: center;
    background: linear-gradient(90deg, color-mix(in srgb, var(--cat) 35%, var(--border)), var(--border));
    min-width: 40px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(272px, 1fr));
    gap: 12px;
  }

  /* ── Empty state ── */
  .empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 24px 0;
    color: var(--text-dim);
    font-size: 12px;
  }

  .empty .hint {
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1.7;
  }

  .empty code {
    color: var(--text-dim);
    background: var(--panel);
    padding: 0 4px;
  }

  .empty strong { color: var(--text); font-weight: 500; }

  .reset {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: .12em;
    text-transform: uppercase;
    padding: 5px 11px;
    background: none;
    border: 1px solid var(--border-hi);
    color: var(--text-dim);
    cursor: pointer;
    transition: border-color .15s, color .15s;
  }

  .reset:hover {
    border-color: var(--accent-dim);
    color: var(--accent);
  }

  /* ── Footer ── */
  footer {
    display: grid;
    grid-template-columns: minmax(220px, 1.4fr) repeat(2, minmax(180px, 1fr));
    gap: 24px 40px;
    padding: 28px clamp(16px, 2.5vw, 40px) 36px;
    border-top: 1px solid var(--border);
    background: var(--panel);
  }

  .foot-col {
    display: flex;
    flex-direction: column;
    gap: 7px;
    font-size: 10.5px;
    color: var(--text-muted);
    letter-spacing: .04em;
    line-height: 1.7;
  }

  .foot-brand p { max-width: 340px; }

  .foot-label {
    font-size: 9px;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 2px;
  }

  .foot-col a {
    color: var(--text-muted);
    text-decoration: none;
    transition: color .12s;
    width: fit-content;
  }

  .foot-col a:hover { color: var(--accent); }

  @media (max-width: 720px) {
    footer { grid-template-columns: 1fr; }
    .cat-tagline { display: none; }
  }
</style>
