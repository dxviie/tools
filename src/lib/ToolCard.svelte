<script lang="ts">
  import type { Tool } from '$lib/types';
  import { getCategory } from '$lib/catalog';
  import ToolIcon from '$lib/ToolIcon.svelte';

  export let tool: Tool;

  $: category = getCategory(tool.category);
</script>

<a href="/tool/{tool.slug}" class="card" style="--cat: {category.color}">
  <div class="top">
    <span class="icon"><ToolIcon seed={tool.slug} family={category.icon} size={46} /></span>
    <span class="arrow" aria-hidden="true">↗</span>
  </div>
  <span class="name">{tool.name}</span>
  {#if tool.description}
    <p class="description">{tool.description}</p>
  {/if}
  <div class="tags">
    {#each tool.tags as tag}
      <span class="tag">{tag}</span>
    {/each}
  </div>
</a>

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 218px;
    padding: 16px 18px 14px;
    background: var(--bg);
    border: 1px solid var(--border);
    text-decoration: none;
    color: inherit;
    overflow: hidden;
    transition: background .15s, border-color .15s;
  }

  .card:hover,
  .card:focus-visible {
    background: var(--panel);
    border-color: color-mix(in srgb, var(--cat) 45%, var(--border));
    outline: none;
  }

  /* plotter-style registration ticks on hover */
  .card::before,
  .card::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    opacity: 0;
    pointer-events: none;
    transition: opacity .15s;
  }

  .card::before {
    top: -1px;
    left: -1px;
    border-top: 2px solid var(--cat);
    border-left: 2px solid var(--cat);
  }

  .card::after {
    bottom: -1px;
    right: -1px;
    border-bottom: 2px solid var(--cat);
    border-right: 2px solid var(--cat);
  }

  .card:hover::before,
  .card:hover::after,
  .card:focus-visible::before,
  .card:focus-visible::after {
    opacity: 1;
  }

  .top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .icon {
    color: var(--cat);
    opacity: .75;
    transition: opacity .15s;
  }

  .card:hover .icon,
  .card:focus-visible .icon {
    opacity: 1;
  }

  .arrow {
    font-size: 13px;
    color: var(--cat);
    opacity: 0;
    transition: opacity .15s;
  }

  .card:hover .arrow,
  .card:focus-visible .arrow {
    opacity: 1;
  }

  .name {
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: .16em;
    text-transform: uppercase;
    line-height: 1.45;
    color: var(--text);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color .15s;
  }

  .card:hover .name,
  .card:focus-visible .name {
    color: var(--cat);
  }

  .description {
    font-size: 11px;
    color: var(--text-dim);
    line-height: 1.6;
    letter-spacing: .02em;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .tags {
    display: flex;
    gap: 5px;
    margin-top: auto;
    overflow: hidden;
    flex-wrap: nowrap;
    mask-image: linear-gradient(90deg, #000 82%, transparent);
    -webkit-mask-image: linear-gradient(90deg, #000 82%, transparent);
  }

  .tag {
    font-size: 9px;
    padding: 2px 6px;
    border: 1px solid var(--border-hi);
    color: var(--text-dim);
    letter-spacing: .1em;
    text-transform: uppercase;
    white-space: nowrap;
    flex-shrink: 0;
  }
</style>
