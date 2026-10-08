import { describe, expect, it } from 'vitest'
import { decodeSlip, encodeSlip } from '../app/utils/share'
import type { SlipForm } from '../app/composables/useSlip'

const form: SlipForm = {
  kind: 'prenos',
  urgent: true,
  payer: 'Đorđe Šćekić\nNjegoševa 5',
  purpose: 'Kirija за октобар',
  payee: 'Marija Ž.',
  payerAccount: '510-12345-67',
  debitModel: '',
  debitReference: '',
  amount: '450,00',
  paymentCode: '',
  account: '510-30280140-23',
  model: '18',
  reference: '0205973210263-302',
  place: 'Podgorica',
}

describe('share link', () => {
  it('round-trips UTF-8 slips', () => {
    const encoded = encodeSlip(form)
    expect(encoded).toMatch(/^[\w-]+$/)
    expect(decodeSlip(encoded)).toEqual(form)
  })

  it('drops trailing empty fields', () => {
    const short = encodeSlip({ ...form, urgent: false, place: '', payerAccount: '' })
    expect(decodeSlip(short)).toEqual({
      kind: 'prenos', payer: form.payer, purpose: form.purpose, payee: form.payee, amount: '450,00',
      account: form.account, model: '18', reference: form.reference,
    })
  })

  it('rejects garbage', () => {
    expect(decodeSlip('!!!')).toBeNull()
    expect(decodeSlip(btoa('[2,"x"]'))).toBeNull()
  })
})
