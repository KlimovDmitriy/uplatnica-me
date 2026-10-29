<script setup lang="ts">
const { t } = useI18n()
const donateState = useDonate()
const donate = ref<{ open: () => void }>()
const info = ref<{ open: () => void }>()
</script>

<template>
  <div class="shell">
    <a
      href="#main"
      class="skip-link no-print"
    >{{ t('nav.skip') }}</a>

    <header class="top no-print">
      <div class="container">
        <LangLink
          to="/"
          class="brand"
        >
          Uplatnica <small>CG</small>
        </LangLink>
        <div class="actions">
          <button
            type="button"
            class="info-btn narrow-only"
            :aria-label="donateState.enabled ? t('nav.info') : t('nav.infoPlain')"
            @click="info?.open()"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
              aria-hidden="true"
            ><path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 6.8a4.5 4.5 0 0 1 8 2.7c0 6.1-8 11-8 11z" /></svg>
          </button>
          <LangSwitcher />
        </div>
      </div>
    </header>

    <main
      id="main"
      tabindex="-1"
    >
      <slot />
    </main>

    <footer class="footer no-print">
      <div class="container">
        <SiteInfo @donate="donate?.open()" />
      </div>
    </footer>

    <InfoDialog
      ref="info"
      @donate="donate?.open()"
    />

    <DonateDialog
      v-if="donateState.enabled"
      ref="donate"
    />
    <ClientOnly>
      <LangSuggest />
    </ClientOnly>
  </div>
</template>

<style scoped>
.top { border-bottom: 1px solid var(--border); background: var(--surface); }
.top .container { display: flex; justify-content: space-between; align-items: center; gap: var(--s-4); min-height: 56px; }
.brand { font-size: var(--fs-lg); font-weight: var(--fw-semibold); color: var(--text); text-decoration: none; }
.brand:hover { color: var(--text); }
.brand small { font-size: var(--fs-sm); font-weight: var(--fw-regular); color: var(--text-muted); }
main:focus { outline: none; }
.actions { display: flex; align-items: center; gap: var(--s-2); }
.info-btn {
  display: grid; place-items: center; width: 44px; height: 44px; padding: 0;
  border: 0; border-radius: var(--r-sm); background: none; color: var(--text-muted); cursor: pointer;
}
.info-btn:hover { background: var(--surface-2); color: var(--text); }
.footer { margin-top: var(--s-8); border-top: 1px solid var(--border); padding: var(--s-5) 0 var(--s-6); }
@media (max-width: 599.98px) { .footer { margin-top: var(--s-7); } }
@media (min-width: 960px) {
  .footer { position: fixed; inset: auto 0 0; z-index: 5; height: var(--footer-h); margin: 0; padding: 0; background: var(--surface); }
  .footer .container { height: 100%; }
  .shell { padding-bottom: var(--footer-h); }
}
@media print { .shell { padding-bottom: 0; } }
</style>
