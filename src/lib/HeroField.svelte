<script lang="ts">
  import { generateRidges } from '$lib/generative';
  import { categories } from '$lib/catalog';

  const palette = [
    categories.find(c => c.id === 'plotting')?.color ?? '#c8f060',
    categories.find(c => c.id === 'vision')?.color ?? '#7ad9f2',
    categories.find(c => c.id === 'studio')?.color ?? '#f2a25c'
  ];

  const ridges = generateRidges('dxviie-tools-hero');
</script>

<svg
  class="hero-field"
  viewBox="0 0 1440 300"
  preserveAspectRatio="xMidYMax slice"
  aria-hidden="true"
>
  {#each ridges as r}
    <path d={r.d} fill="none" stroke={palette[r.channel]} stroke-width="1.2" opacity={r.op} />
  {/each}
</svg>

<style>
  .hero-field {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
