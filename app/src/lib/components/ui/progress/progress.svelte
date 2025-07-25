<script lang="ts">
  import { Progress as ProgressPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

  type $$Props = ProgressPrimitive.Props;

  export let value: number = 0;
  export let classname = "";
</script>

<ProgressPrimitive.Root
  class={cn(
    "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
    classname
  )}
  value={value}
  max={100}
  {...$$restProps}
>
  <ProgressPrimitive.Indicator
    class="h-full w-full flex-1 bg-primary transition-all"
    style={`transform: translateX(-${100 - (value || 0)}%)`}
  />
</ProgressPrimitive.Root>
