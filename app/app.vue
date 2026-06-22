<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import LiveMarkets from '~/components/LiveMarkets.vue'
</script>

<template>
  <div class="min-h-screen bg-fx-neutral-900">
    <NuxtRouteAnnouncer />
    <AppHeader />
    <LiveMarkets />
    <NuxtPage />
  </div>
</template>
