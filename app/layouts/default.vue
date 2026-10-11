<script setup lang="ts">
const { t } = useI18n()
const donate = ref<{ open: () => void }>()
</script>

<template>
  <div>
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
        <LangSwitcher />
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
        <p class="links">
          <LangLink to="/#poziv-na-broj">
            {{ t('reference.title') }}
          </LangLink>
          <LangLink to="/#provjera-racuna">
            {{ t('account.title') }}
          </LangLink>
          <button
            type="button"
            class="link"
            @click="donate?.open()"
          >
            {{ t('donate.button') }}
          </button>
        </p>
        <p class="disclaimer">
          {{ t('footer.disclaimer') }}
        </p>
      </div>
    </footer>

    <DonateDialog ref="donate" />
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
.footer { margin-top: var(--s-8); border-top: 1px solid var(--border); padding: var(--s-5) 0 var(--s-6); font-size: var(--fs-sm); }
.links { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-4); margin: 0 0 var(--s-3); }
.links > * { display: inline-flex; align-items: center; min-height: 24px; }
.disclaimer { margin: 0; max-width: var(--measure); font-size: var(--fs-xs); color: var(--text-muted); }
@media (max-width: 599.98px) { .footer { margin-top: var(--s-7); } }
</style>
