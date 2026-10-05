<script setup lang="ts">
defineProps<{ to: string }>()
const lp = useLangPath()
</script>

<template>
  <NuxtLink :to="lp(to)">
    <slot />
  </NuxtLink>
</template>
