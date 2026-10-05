<script setup lang="ts">
const { t } = useI18n()
const donate = ref<{ open: () => void }>()
</script>

<template>
  <div>
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

    <main>
      <slot />
    </main>

    <footer class="footer no-print">
      <div class="container">
        <p>
          <button
            type="button"
            class="link"
            @click="donate?.open()"
          >
            {{ t('donate.button') }}
          </button>
        </p>
        <p class="small">
          {{ t('footer.disclaimer') }}
        </p>
      </div>
    </footer>

    <DonateDialog ref="donate" />
  </div>
</template>

<style scoped>
.top { border-bottom: 1px solid #ccc; }
.top .container { display: flex; justify-content: space-between; align-items: baseline; padding-top: 10px; padding-bottom: 8px; }
.brand { font-size: 18px; font-weight: 700; text-decoration: none; }
.brand small { font-size: 12px; font-weight: 400; color: #777; }
.footer { border-top: 1px solid #ccc; margin-top: 40px; padding: 12px 0 24px; font-size: 13px; }
.footer p { margin: 0 0 4px; }
.small { color: #777; font-size: 12px; }
</style>
