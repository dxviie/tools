<script lang="ts">
  import type { Tool } from '$lib/types';
  export let tool: Tool;
</script>

<a href="/tool/{tool.slug}" class="card">
  <span class="name">{tool.name}</span>
  {#if tool.description}
    <p class="description">{tool.description}</p>
  {/if}
  {#if tool.tags.length > 0}
    <div class="tags">
      {#each tool.tags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  {/if}
  <span class="arrow">→</span>
</a>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 20px 22px;
    background: var(--bg);
    text-decoration: none;
    color: inherit;
    transition: background .12s;
    position: relative;
    min-height: 100px;
  }

  .card:hover {
    background: var(--panel);
  }

  .card:hover .name {
    color: var(--accent);
  }

  .card:hover .arrow {
    opacity: 1;
    color: var(--accent);
  }

  .name {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--text);
    transition: color .12s;
  }

  .description {
    font-size: 11px;
    color: var(--text-dim);
    line-height: 1.65;
    letter-spacing: .03em;
  }

  .tags {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    margin-top: 2px;
  }

  .tag {
    font-size: 9px;
    padding: 1px 6px;
    border: 1px solid var(--border-hi);
    color: var(--text-muted);
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .arrow {
    position: absolute;
    bottom: 18px;
    right: 20px;
    font-size: 12px;
    color: var(--text-muted);
    opacity: 0;
    transition: opacity .12s, color .12s;
  }
</style>
