<script setup lang="ts">
const { t } = useI18n()
const { setForm } = useSlip()
const { items, editing, load, remove, clear } = useBatch()
const busy = ref(false)

onMounted(load)

const pages = computed(() => Math.ceil(items.value.length / 3))

function edit(id: string) {
  const item = items.value.find(it => it.id === id)
  if (!item) return
  setForm(item.form)
  editing.value = id
}

async function download() {
  busy.value = true
  try {
    const svgs = items.value.map(it => renderSlipSvg(it.form))
    downloadBlob(await slipsToPdf(svgs), `nalozi-${items.value.length}.pdf`)
  }
  finally { busy.value = false }
}
</script>

<template>
  <section
    v-if="items.length"
    class="batch card"
    aria-labelledby="batch-title"
  >
    <h3 id="batch-title">
      {{ t('batch.title') }} <small>({{ t('batch.count', { n: items.length, pages }) }})</small>
    </h3>
    <ol class="batch-list">
      <li
        v-for="(it, i) in items"
        :key="it.id"
        :class="{ editing: editing === it.id }"
      >
        <span class="payee"><span class="n">{{ i + 1 }}.</span> {{ it.form.payee.split('\n')[0] || '—' }}</span>
        <span class="num">{{ it.form.amount }}</span>
        <span class="ops">
          <button
            type="button"
            class="btn quiet small"
            @click="edit(it.id)"
          >
            {{ t('batch.edit') }}<span class="sr-only">{{ ` ${t('batch.item', { n: i + 1 })}` }}</span>
          </button>
          <button
            type="button"
            class="btn quiet small"
            @click="remove(it.id)"
          >
            {{ t('batch.delete') }}<span class="sr-only">{{ ` ${t('batch.item', { n: i + 1 })}` }}</span>
          </button>
        </span>
      </li>
    </ol>
    <p class="foot">
      <button
        type="button"
        class="btn"
        :disabled="busy"
        @click="download"
      >
        {{ busy ? t('batch.building') : t('batch.download', { n: items.length }) }}
      </button>
      <button
        type="button"
        class="btn quiet clear"
        @click="clear"
      >
        {{ t('batch.clear') }}
      </button>
    </p>
  </section>
</template>

<style scoped>
h3 { margin: 0 0 var(--s-3); }
h3 small { font-size: var(--fs-md); font-weight: var(--fw-regular); color: var(--text-muted); }
.batch-list { list-style: none; margin: 0; padding: 0; }
.batch-list li {
  display: grid; grid-template-columns: 1fr auto auto; gap: var(--s-2) var(--s-4); align-items: center;
  padding: var(--s-2) 0; border-bottom: 1px solid var(--border);
}
.batch-list li.editing { background: var(--accent-weak); border-radius: var(--r-sm); padding-inline: var(--s-2); }
.payee { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.n { color: var(--text-muted); }
.num { text-align: right; white-space: nowrap; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
.ops { display: flex; gap: var(--s-2); }
.foot { display: flex; flex-wrap: wrap; gap: var(--s-2); align-items: center; margin: var(--s-4) 0 0; }
.clear { color: var(--text-muted); }
@media (max-width: 599.98px) {
  .batch-list li { grid-template-columns: 1fr auto; }
  .ops { grid-column: 1 / -1; }
}
</style>
