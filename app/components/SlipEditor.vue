<script setup lang="ts">
/**
 * The slip itself is the form: the blank drawing (renderSlipSvg without values) with
 * transparent inputs placed over its fields. Used on screens wide enough to type into it.
 */
import type { SlipBox } from '~/utils/slipSvg'
import type { SlipForm } from '~/composables/useSlip'

const { t } = useI18n()
const { form } = useSlip()
const { problemFor } = useSlipProblems()

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

/** Centred on the drawn tick box, with a hit area of at least 24 × 24 px. */
const tickPos = (key: keyof typeof TICKS) => ({
  left: `${((TICKS[key].box + TICKS[key].w / 2) / 210) * 100}%`,
  top: `${((TICK.y + TICK.h / 2) / 99) * 100}%`,
  width: `max(24px, calc(${TICKS[key].w} * var(--u)))`,
  height: `max(24px, calc(${TICK.h} * var(--u)))`,
})

const label = (key: keyof SlipForm) => t(slipFieldLabel(key))
const invalid = (key: keyof SlipForm) => (problemFor(key) ? 'true' : undefined)
const describedBy = (key: keyof SlipForm) => (problemFor(key) ? slipErrorId(key) : undefined)

const inputmode = (b: SlipBox) => (b.key === 'amount' ? 'decimal' : b.mono && b.key !== 'debitReference' && b.key !== 'reference' ? 'numeric' : 'text')
</script>

<template>
  <div class="editor">
    <div
      class="paper"
      aria-hidden="true"
      v-html="background"
    />

    <!-- The tick boxes of the header row come first, in the order they are drawn (TICKS): Hitnost, Prenos, Uplata. -->
    <label
      class="tick"
      :class="{ off: form.kind !== 'prenos' }"
      :style="tickPos('urgent')"
      :title="t('slip.urgentHint')"
    ><input
      v-model="form.urgent"
      type="checkbox"
      class="sr-only"
      :disabled="form.kind !== 'prenos'"
    ><span
      aria-hidden="true"
      class="mark"
    >{{ form.kind === 'prenos' && form.urgent ? '×' : '' }}</span><span class="sr-only">{{ t('slip.urgent') }}</span></label>
    <fieldset class="ticks">
      <legend class="sr-only">
        {{ t('slip.kindOnSlip') }}
      </legend>
      <label
        v-for="k in (['prenos', 'uplata'] as const)"
        :key="k"
        class="tick"
        :style="tickPos(k)"
      ><input
        v-model="form.kind"
        type="radio"
        class="sr-only"
        name="slip-tick-kind"
        :value="k"
      ><span
        aria-hidden="true"
        class="mark"
      >{{ form.kind === k ? '×' : '' }}</span><span class="sr-only">{{ t(`kinds.${k}.title`) }}</span></label>
    </fieldset>

    <template
      v-for="b in SLIP_BOXES"
      :key="b.key"
    >
      <textarea
        v-if="b.multiline"
        :id="`e-${b.key}`"
        v-model="form[b.key]"
        class="cell multi"
        :aria-invalid="invalid(b.key)"
        :aria-describedby="describedBy(b.key)"
        :style="boxPos(b)"
        :aria-label="label(b.key)"
        :placeholder="b.key === 'payer' ? t('form.payerPlaceholder') : b.key === 'payee' ? t('form.payeePlaceholder') : ''"
        rows="3"
        spellcheck="false"
      />
      <input
        v-else
        :id="`e-${b.key}`"
        v-model="form[b.key]"
        class="cell"
        :class="{ mono: b.mono, center: b.anchor === 'middle' }"
        :aria-invalid="invalid(b.key)"
        :aria-describedby="describedBy(b.key)"
        :style="boxPos(b)"
        :aria-label="label(b.key)"
        :placeholder="b.key === 'payerAccount' && form.kind === 'uplata' ? '' : PLACEHOLDER[b.key] ?? ''"
        :disabled="b.key === 'payerAccount' && form.kind === 'uplata'"
        :list="b.key === 'model' || b.key === 'debitModel' ? 'slip-models' : undefined"
        :inputmode="inputmode(b)"
        :maxlength="b.key === 'paymentCode' ? 3 : b.key === 'model' || b.key === 'debitModel' ? 2 : undefined"
        autocomplete="off"
        spellcheck="false"
      >
    </template>

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
  border: 0;
  background: #fff;
  box-shadow: var(--shadow-paper);
}
.paper { position: absolute; inset: 0; line-height: 0; }
.paper :deep(svg) { width: 100%; height: 100%; display: block; }

.cell {
  position: absolute;
  margin: 0;
  min-height: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: rgb(29 91 191 / .05);
  transition: background-color .12s;
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
.cell:hover:not(:disabled) { background: rgb(29 91 191 / .09); }
.cell:focus { outline: 2px solid var(--accent); outline-offset: -2px; background: #fff; box-shadow: none; }
/* Error: dashed red, so it never looks like the solid blue focus ring; focused + error is solid red. */
.cell[aria-invalid="true"] { outline: 2px dashed var(--error); outline-offset: -2px; background: rgb(180 35 24 / .06); }
.cell[aria-invalid="true"]:focus { outline-style: solid; background: #fff; }
.cell:disabled { background: repeating-linear-gradient(135deg, transparent 0 4px, rgb(0 0 0 / .04) 4px 5px); }
.cell::placeholder { color: var(--text-muted); font-weight: 400; }

/* Native radios / checkbox inside the labels, so the tick boxes are real form controls. */
.ticks { position: absolute; inset: 0; margin: 0; padding: 0; border: 0; min-width: 0; pointer-events: none; }
.tick {
  position: absolute;
  transform: translate(-50%, -50%);
  display: grid; place-items: center;
  background: rgb(29 91 191 / .05);
  cursor: pointer;
  pointer-events: auto;
  transition: background-color .12s;
}
.tick:hover:not(.off) { background: rgb(29 91 191 / .09); }
.tick:has(input:focus-visible) { outline: 2px solid var(--accent); outline-offset: -2px; background: #fff; }
.tick.off { cursor: default; background: transparent; }
.mark { font-size: calc(5 * var(--u)); line-height: 1; color: #000; }
</style>
