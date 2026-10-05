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
  <div
    v-if="items.length"
    class="batch"
  >
    <h2>{{ t('batch.title') }} <small>({{ t('batch.count', { n: items.length, pages }) }})</small></h2>
    <table>
      <tbody>
        <tr
          v-for="(it, i) in items"
          :key="it.id"
          :class="{ editing: editing === it.id }"
        >
          <td class="n">
            {{ i + 1 }}.
          </td>
          <td>{{ it.form.payee.split('\n')[0] || '—' }}</td>
          <td class="amount">
            {{ it.form.amount }}
          </td>
          <td class="ops">
            <button
              type="button"
              class="link"
              @click="edit(it.id)"
            >
              {{ t('batch.edit') }}
            </button>
            <button
              type="button"
              class="link"
              @click="remove(it.id)"
            >
              {{ t('batch.delete') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p>
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
        class="link"
        @click="clear"
      >
        {{ t('batch.clear') }}
      </button>
    </p>
  </div>
</template>

<style scoped>
.batch { margin-top: 8px; }
h2 { font-size: 15px; margin: 0 0 6px; }
h2 small { font-weight: 400; color: #777; }
table { border-collapse: collapse; width: 100%; max-width: 600px; font-size: 13px; }
td { padding: 4px 8px 4px 0; border-bottom: 1px solid #e5e5e5; }
.n { width: 2em; color: #777; }
.amount { text-align: right; white-space: nowrap; font-family: 'Courier New', monospace; }
.ops { text-align: right; white-space: nowrap; }
.ops .link + .link { margin-left: 10px; }
tr.editing td { font-weight: 700; }
p { display: flex; gap: 12px; align-items: center; margin: 10px 0 0; font-size: 13px; }
</style>
