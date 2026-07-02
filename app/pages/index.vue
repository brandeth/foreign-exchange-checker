<template>
  <main class="min-h-screen bg-fx-neutral-900 px-6 py-9 text-fx-neutral-50">
    <div class="mx-auto flex max-w-[1036px] flex-col gap-12">
      <CheckRate />

      <section class="flex flex-col gap-6 border-t border-fx-neutral-400 pt-8">
        <div class="flex flex-col gap-4">
          <p class="text-preset-5-medium uppercase text-fx-lime-500">Foreign Exchange Checker</p>
          <h1 class="text-preset-1-tablet md:text-preset-1 max-w-3xl">
            Build interface primitives from a visible token baseline.
          </h1>
        </div>

        <NuxtLink
          to="/design-system"
          class="text-preset-3-medium inline-flex w-fit items-center justify-center border border-fx-lime-500 bg-fx-lime-500 px-5 py-3 text-fx-neutral-900 transition hover:bg-fx-neutral-900 hover:text-fx-lime-500 focus:outline-2 focus:outline-offset-4 focus:outline-fx-lime-500"
        >
          Open Design System
        </NuxtLink>
      </section>
    </div>
  </main>
</template>
