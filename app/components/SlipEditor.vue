<script setup lang="ts">
/**
 * The slip itself is the form: the blank drawing (renderSlipSvg without values) with
 * transparent inputs placed over its fields. Used on screens wide enough to type into it.
 */
import type { SlipBox } from '~/utils/slipSvg'
import type { SlipForm } from '~/composables/useSlip'

const { t } = useI18n()
const { form, fieldError } = useSlip()

const background = renderSlipSvg(form.value, false)

const PLACEHOLDER: Partial<Record<keyof SlipForm, string>> = {
  payerAccount: '000-0000000000-00',
  account: '000-0000000000-00',
  amount: '0,00',
  model: '18',
  place: 'Podgorica, 01.10.2026.',
}

const pos = (x: number, y: number, w: number, h: number) => ({
  left: `${(x / 210) * 100}%`,
  top: `${(y / 99) * 100}%`,
  width: `${(w / 210) * 100}%`,
  height: `${(h / 99) * 100}%`,
})
const boxPos = (b: SlipBox) => pos(b.x, b.y, b.w, b.h)
const tickPos = (key: keyof typeof TICKS) => pos(TICKS[key].box, TICK.y, TICK.size, TICK.size)

const inputmode = (b: SlipBox) => (b.key === 'amount' ? 'decimal' : b.mono && b.key !== 'debitReference' && b.key !== 'reference' ? 'numeric' : 'text')
</script>

<template>
  <div class="editor">
    <div
      class="paper"
      v-html="background"
    />
    <template
      v-for="b in SLIP_BOXES"
      :key="b.key"
    >
      <textarea
        v-if="b.multiline"
        v-model="form[b.key]"
        class="cell multi"
        :class="{ invalid: fieldError(b.key) }"
        :style="boxPos(b)"
        :aria-label="LABELS[b.caption]"
        :placeholder="b.key === 'payer' ? t('form.payerPlaceholder') : b.key === 'payee' ? t('form.payeePlaceholder') : ''"
        rows="3"
        spellcheck="false"
      />
      <input
        v-else
        v-model="form[b.key]"
        class="cell"
        :class="{ invalid: fieldError(b.key), mono: b.mono, center: b.anchor === 'middle' }"
        :style="boxPos(b)"
        :aria-label="LABELS[b.caption]"
        :placeholder="b.key === 'payerAccount' && form.kind === 'uplata' ? '' : PLACEHOLDER[b.key] ?? ''"
        :disabled="b.key === 'payerAccount' && form.kind === 'uplata'"
        :list="b.key === 'model' || b.key === 'debitModel' ? 'slip-models' : undefined"
        :inputmode="inputmode(b)"
        :maxlength="b.key === 'paymentCode' ? 3 : b.key === 'model' || b.key === 'debitModel' ? 2 : undefined"
        autocomplete="off"
        spellcheck="false"
      >
    </template>

    <button
      v-for="k in (['prenos', 'uplata'] as const)"
      :key="k"
      type="button"
      class="tick"
      :style="tickPos(k)"
      :aria-pressed="form.kind === k"
      :aria-label="t(`kinds.${k}.title`)"
      @click="form.kind = k"
    >
      {{ form.kind === k ? '×' : '' }}
    </button>
    <button
      type="button"
      class="tick"
      :style="tickPos('urgent')"
      :disabled="form.kind !== 'prenos'"
      :aria-pressed="form.urgent"
      :aria-label="t('slip.urgent')"
      :title="t('slip.urgentHint')"
      @click="form.urgent = !form.urgent"
    >
      {{ form.kind === 'prenos' && form.urgent ? '×' : '' }}
    </button>

    <datalist id="slip-models">
      <option value="18" />
      <option value="05" />
    </datalist>
  </div>
</template>

<style scoped>
.editor {
  --u: calc(100cqw / 210);
  container-type: inline-size;
  position: relative;
  aspect-ratio: 210 / 99;
  border: 1px solid #bbb;
  background: #fff;
}
.paper { position: absolute; inset: 0; line-height: 0; }
.paper :deep(svg) { width: 100%; height: 100%; display: block; }

.cell {
  position: absolute;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: calc(3 * var(--u));
  line-height: calc(3.8 * var(--u));
  padding: calc(.6 * var(--u)) calc(1.2 * var(--u));
  resize: none;
  overflow: hidden;
}
.cell.mono { font-family: 'Courier New', monospace; font-weight: 700; }
.cell.center { text-align: center; }
.cell:hover:not(:disabled) { background: rgb(0 0 0 / .03); }
.cell:focus { outline: none; background: rgb(0 0 0 / .06); }
.cell:disabled { background: repeating-linear-gradient(135deg, transparent 0 4px, rgb(0 0 0 / .04) 4px 5px); }
.cell.invalid { outline: 2px solid #000; outline-offset: -2px; }
.cell::placeholder { color: #aaa; font-weight: 400; }

.tick {
  position: absolute;
  padding: 0; border: 0; background: transparent; cursor: pointer;
  font-size: calc(6 * var(--u)); line-height: 1; color: #000;
}
.tick:hover:not(:disabled) { background: rgb(0 0 0 / .05); }
.tick:disabled { cursor: default; }
</style>
