import { describe, expect, it } from 'vitest'
import { parseAmount } from '../app/composables/useSlip'

describe('parseAmount', () => {
  it.each([
    ['1.234,56', 1234.56],
    ['1234,56', 1234.56],
    ['1234.56', 1234.56],
    ['1 234', 1234],
    ['1 234,5', 1234.5],
    ['0,5', 0.5],
    ['12.000', 12000],
    ['1.234.567,89', 1234567.89],
    ['1.5', 1.5],
  ])('%s → %d', (raw, expected) => {
    expect(parseAmount(raw)).toBe(expected)
  })

  // Ambiguous dots must not turn into a 1000× larger amount.
  it.each(['1234.567', '0.500', '1.23,45', '1.2345', '1,234.56', '', ',5', '12,345', '-5'])('%s → NaN', (raw) => {
    expect(parseAmount(raw)).toBeNaN()
  })
})
