<script lang="ts">
  import { generateIcon } from '$lib/generative';

  export let seed: string;
  export let family: string = 'grid';
  export let size: number = 44;

  $: shapes = generateIcon(seed, family);
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 64 64"
  aria-hidden="true"
  class="tool-icon"
>
  {#each shapes as s}
    <path
      d={s.d}
      fill={s.fill ? 'currentColor' : 'none'}
      stroke={s.fill ? 'none' : 'currentColor'}
      stroke-width={s.sw}
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity={s.op}
    />
  {/each}
</svg>

<style>
  .tool-icon {
    display: block;
    flex-shrink: 0;
  }
</style>
