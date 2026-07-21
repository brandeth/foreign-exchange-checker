<template>
  <header class="app-header flex h-[66px] items-center justify-between gap-4 overflow-hidden bg-transparent px-6 py-5">
    <NuxtLink to="/" aria-label="FX Checker home" class="inline-flex shrink-0 items-center">
      <img src="~/assets/logo-with-text.svg" alt="" class="h-[26px] w-[139px]" aria-hidden="true">
    </NuxtLink>

    <p class="app-header__meta text-preset-4 min-w-0 text-right uppercase text-fx-neutral-200">55 Currencies &middot; EOD &middot; ECB Data</p>
  </header>
</template>

<style scoped>
@reference "~/assets/css/main.css";

@media (max-width: 639px) {
  .app-header {
    @apply gap-2;
  }

  .app-header img {
    @apply h-[21px] w-[113px];
  }

  .app-header__meta {
    @apply whitespace-nowrap text-preset-6;
  }
}

@media (min-width: 640px) and (max-width: 1024px) {
  header {
    @apply h-[88px] px-8 py-6;
  }

  header img {
    @apply h-[35px] w-[186px];
  }

  header p {
    @apply text-preset-3;
  }
}
</style>
