import type { Localized } from '~/composables/useLocalized'
import type { SlipForm } from '~/composables/useSlip'
import type { LocalRevenue } from '#shared/utils/municipalities'

export type TemplateCategory = 'taxes' | 'local' | 'fines' | 'documents'

/**
 * Model 18 poziv na broj builder shown above the slip: PIB/JMB + municipality code
 * (or a fixed revenue code, e.g. 003 for traffic fines).
 */
export interface ReferenceTool {
  /** Fixed 3-digit code instead of the municipality. */
  code?: string
  /** Municipal account to put on the slip when a municipality is chosen. */
  localAccount?: LocalRevenue
  /** Second payee line after the municipality name: "Porez na nepokretnosti". */
  payeeLine?: string
}

export interface TemplatePayment {
  id: string
  label: Localized
  /** Fields prefilled on the slip. Leave amount empty when it depends on the case. */
  preset: Partial<SlipForm>
  /** How to fill the reference numbers. */
  referenceHint?: Localized
  amountNote?: Localized
  tool?: ReferenceTool
  /**
   * Overrides whether an empty reference (odobrenje) blocks the order. Left out, it follows
   * referenceRule(): models 18 and 05 on a public-revenue account need one. Set false where the payee accepts none.
   */
  referenceRequired?: boolean
}

/** Who matches the payment to the payer by its reference; picks the wording of the "reference required" error. */
export type ReferenceRule = 'tax' | 'mup' | 'institution'

/** Models that Naredba o načinu uplate javnih prihoda (čl. 4) prescribes for public revenue. */
const REQUIRED_MODELS = ['18', '05']

/**
 * Public-revenue accounts of the Naredba: 820 (Uprava prihoda), 805 (Uprava carina), 825 (MUP),
 * 832 (ministries, courts, municipal fines), 840 (Uprava policije). Municipal accounts sit in
 * ordinary banks (510, 530, 535 ...), so a payment with a municipality picker counts instead.
 */
const BUDGET_ACCOUNT = /^(820|805|825|832|840)-/

/** The payer is identified only by the model and the reference, so an empty one cannot be matched. */
export function referenceRule(payment?: Pick<TemplatePayment, 'preset' | 'tool' | 'referenceRequired'>): ReferenceRule | null {
  if (!payment) return null
  const { account = '', model = '' } = payment.preset
  // MUP (825) gives its 9-digit reference only at the counter, so a slip prepared in advance can't have it.
  const budget = (BUDGET_ACCOUNT.test(account) && !account.startsWith('825-')) || !!payment.tool?.localAccount
  if (!(payment.referenceRequired ?? (budget && REQUIRED_MODELS.includes(model)))) return null
  return /^(820|805)-/.test(account) ? 'tax' : account.startsWith('825-') ? 'mup' : 'institution'
}

export interface PaymentTemplate {
  slug: string
  category: TemplateCategory
  /** Short name for lists: "Lična karta". */
  name: Localized
  /** Page heading: "Nalog za plaćanje lične karte". */
  title: Localized
  metaDescription: Localized
  intro: Localized
  payments: TemplatePayment[]
  fees?: { label: Localized, amount: number }[]
  notes: Localized[]
  sources: { label: string, url: string }[]
  /** Month the data was checked against the sources, "YYYY-MM". */
  checkedAt: string
}

const NAREDBA = { label: 'Naredba o načinu uplate javnih prihoda (Sl. list CG 23/26)', url: 'https://www.sluzbenilist.me/propisi/391599' }
const PRILOZI = { label: 'Naredba 23/26: šifre opština (Prilog 1)', url: 'https://www.sluzbenilist.me/propisi/391599?page=72' }
const MUP_PASSPORT = { label: 'MUP: izdavanje pasoša (14.01.2025)', url: 'https://www.gov.me/dokumenta/d765c42e-bdff-4fc4-b667-dff1001d0722' }
const MUP_ID = { label: 'MUP: izdavanje lične karte', url: 'https://wapi.gov.me/download/74f6a13f-f56f-4fc0-a129-df01d062e93f?version=1.0' }

const TAX_REFERENCE: Localized = {
  sr: 'Odobrenje: model 18, PIB (pravna lica) ili JMB (fizička lica), crtica i šifra opštine. Zaduženje: poreski period, npr. IX/2026.',
  en: 'Credit: model 18, then the PIB (companies) or JMB (individuals), a dash and the municipality code. Debit: the tax period, e.g. IX/2026.',
  ru: 'Одобрение: модель 18, PIB (для фирм) или JMB (для физлиц), дефис и код общины. Задолженность: налоговый период, например IX/2026.',
}

const LOCAL_REFERENCE: Localized = {
  sr: 'Izaberite opštinu: račun i šifra opštine se upisuju sami. Upišite svoj JMB ili PIB.',
  en: 'Choose the municipality: its account and code are filled in for you. Enter your JMB or PIB.',
  ru: 'Выберите общину: её счёт и код подставятся сами. Введите свой JMB или PIB.',
}

const FINE_NOTE: Localized = {
  sr: 'Račun i poziv na broj uvijek provjerite na samom prekršajnom nalogu: podaci na nalogu imaju prednost.',
  en: 'Always check the account and reference on the penalty notice itself: what it says takes precedence.',
  ru: 'Всегда сверяйте счёт и poziv na broj с самим протоколом о нарушении (prekršajni nalog): данные на нём главнее.',
}

const MUP_REFERENCE: Localized = {
  sr: 'Model 05. Poziv na broj MUP-a ima 9 cifara (šifra opštine, organizacione jedinice i vrste isprave) i dobija se na šalteru.',
  en: 'Model 05. The Ministry of Interior reference has 9 digits (municipality, office and document type) and is given at the counter.',
  ru: 'Модель 05. Poziv na broj МВД состоит из 9 цифр (код общины, отделения и вида документа), его дают в окошке.',
}

const TAX = (id: string, account: string, payee: string, purpose: string): TemplatePayment => ({
  id,
  label: { sr: 'Uplata', en: 'Payment', ru: 'Оплата' },
  preset: { account, payee, purpose, model: '18' },
  referenceHint: TAX_REFERENCE,
  tool: {},
})

const LOCAL = (localAccount: LocalRevenue, payeeLine: string, purpose: string): TemplatePayment => ({
  id: localAccount,
  label: { sr: 'Uplata', en: 'Payment', ru: 'Оплата' },
  preset: { purpose, model: '18' },
  referenceHint: LOCAL_REFERENCE,
  tool: { localAccount, payeeLine },
})

export const TEMPLATES: PaymentTemplate[] = [
  {
    slug: 'porez-i-doprinosi',
    category: 'taxes',
    name: { sr: 'Porez i doprinosi', en: 'Income tax and contributions', ru: 'Налог и взносы' },
    title: { sr: 'Nalog za porez na dohodak i doprinose', en: 'Payment order for income tax and social contributions', ru: 'Платёжка на налог на доходы и соцвзносы' },
    metaDescription: {
      sr: 'Popunjen nalog za jedinstveni račun 820-30000-74: porez na dohodak i doprinosi, model 18, PIB ili JMB i šifra opštine.',
      en: 'Filled order for the single account 820-30000-74: income tax and contributions, model 18, PIB or JMB and municipality code.',
      ru: 'Готовая платёжка на единый счёт 820-30000-74: налог на доходы и взносы, модель 18, PIB или JMB и код общины.',
    },
    intro: {
      sr: 'Od 2011. porez na dohodak fizičkih lica i svi doprinosi (PIO, zdravstvo, nezaposlenost) plaćaju se jednim nalogom na jedinstveni račun. Tako plaćaju poslodavci za zarade i preduzetnici za sebe.',
      en: 'Since 2011 personal income tax and all contributions (pension, health, unemployment) are paid with one order to a single account. Employers pay this for salaries, entrepreneurs for themselves.',
      ru: 'С 2011 года налог на доходы физлиц и все взносы (пенсионный, медицинский, по безработице) платятся одной платёжкой на единый счёт. Так платят работодатели за зарплаты и предприниматели за себя.',
    },
    payments: [{
      ...TAX('uplata', '820-30000-74', 'Jedinstveni račun poreza na dohodak\nfizičkih lica i doprinosa za\nobavezno socijalno osiguranje', 'Porez i doprinosi na zarade'),
      referenceHint: {
        sr: 'Odobrenje: model 18, PIB ili JMB i šifra opštine sjedišta ili prebivališta. Zaduženje: period i broj zaposlenih, npr. IX/2026 3.',
        en: 'Credit: model 18, PIB or JMB and the code of the municipality of the seat or residence. Debit: period and number of employees, e.g. IX/2026 3.',
        ru: 'Одобрение: модель 18, PIB или JMB и код общины регистрации или проживания. Задолженность: период и число работников, например IX/2026 3.',
      },
    }],
    notes: [{
      sr: 'Odvojeni računi doprinosa (820-81…, 820-82…, 820-83…) služe samo za obaveze do 31.12.2010.',
      en: 'The separate contribution accounts (820-81…, 820-82…, 820-83…) are only for obligations up to 31 Dec 2010.',
      ru: 'Отдельные счета взносов (820-81…, 820-82…, 820-83…) нужны только для обязательств до 31.12.2010.',
    }],
    sources: [NAREDBA, PRILOZI],
    checkedAt: '2026-10',
  },
  {
    slug: 'pdv',
    category: 'taxes',
    name: { sr: 'PDV', en: 'VAT', ru: 'НДС (PDV)' },
    title: { sr: 'Nalog za plaćanje PDV-a', en: 'Payment order for VAT (PDV)', ru: 'Платёжка на НДС (PDV)' },
    metaDescription: {
      sr: 'Nalog za porez na dodatu vrijednost: račun 820-15111-24, model 18, PIB i šifra opštine sjedišta.',
      en: 'Order for value added tax: account 820-15111-24, model 18, PIB and the municipality code of the seat.',
      ru: 'Платёжка на налог на добавленную стоимость: счёт 820-15111-24, модель 18, PIB и код общины регистрации.',
    },
    intro: {
      sr: 'PDV se uplaćuje na račun Uprave prihoda i carina. U poziv na broj ide PIB obveznika i šifra opštine u kojoj je sjedište.',
      en: 'VAT goes to the account of the Revenue and Customs Administration. The reference is the taxpayer PIB and the code of the municipality of the seat.',
      ru: 'НДС платится на счёт Налогово-таможенного управления. В poziv na broj идут PIB плательщика и код общины, где зарегистрирована фирма.',
    },
    payments: [TAX('uplata', '820-15111-24', 'Porez na dodatu vrijednost', 'PDV')],
    notes: [{
      sr: 'PDV na usluge stranih lica plaća se na poseban račun 820-15112-21.',
      en: 'VAT on services of foreign persons goes to a separate account, 820-15112-21.',
      ru: 'НДС на услуги иностранных лиц платится на отдельный счёт 820-15112-21.',
    }],
    sources: [NAREDBA],
    checkedAt: '2026-10',
  },
  {
    slug: 'porez-na-dobit',
    category: 'taxes',
    name: { sr: 'Porez na dobit', en: 'Corporate profit tax', ru: 'Налог на прибыль' },
    title: { sr: 'Nalog za porez na dobit pravnih lica', en: 'Payment order for corporate profit tax', ru: 'Платёжка на налог на прибыль' },
    metaDescription: {
      sr: 'Nalog za porez na dobit rezidentnog pravnog lica: račun 820-12111-03, model 18, PIB i šifra opštine.',
      en: 'Order for the profit tax of a resident company: account 820-12111-03, model 18, PIB and municipality code.',
      ru: 'Платёжка на налог на прибыль фирмы-резидента: счёт 820-12111-03, модель 18, PIB и код общины.',
    },
    intro: {
      sr: 'Porez na dobit rezidentnih pravnih lica. Za nerezidente je račun 820-12112-97, za porez po odbitku na dividende 820-12113-94.',
      en: 'Profit tax of resident companies. Non-residents use 820-12112-97, withholding tax on dividends 820-12113-94.',
      ru: 'Налог на прибыль фирм-резидентов. Для нерезидентов счёт 820-12112-97, для налога у источника с дивидендов 820-12113-94.',
    },
    payments: [TAX('uplata', '820-12111-03', 'Porez na dobit rezidentnog\npravnog lica', 'Porez na dobit')],
    notes: [],
    sources: [NAREDBA],
    checkedAt: '2026-10',
  },
  {
    slug: 'porez-na-promet-nepokretnosti',
    category: 'taxes',
    name: { sr: 'Porez na promet nepokretnosti', en: 'Real estate transfer tax', ru: 'Налог на переход недвижимости' },
    title: { sr: 'Nalog za porez na promet nepokretnosti', en: 'Payment order for real estate transfer tax', ru: 'Платёжка на налог с оборота недвижимости' },
    metaDescription: {
      sr: 'Nalog za porez na promet nepokretnosti: račun 820-13111-10, model 18, JMB ili PIB i šifra opštine u kojoj je nepokretnost.',
      en: 'Order for real estate transfer tax: account 820-13111-10, model 18, JMB or PIB and the code of the municipality where the property is.',
      ru: 'Платёжка на налог с оборота недвижимости: счёт 820-13111-10, модель 18, JMB или PIB и код общины, где находится объект.',
    },
    intro: {
      sr: 'Plaća se po rješenju Uprave prihoda i carina nakon kupoprodaje. Šifra opštine je ona u kojoj se nepokretnost nalazi.',
      en: 'Paid on the decision of the Revenue and Customs Administration after a sale. Use the code of the municipality where the property is.',
      ru: 'Платится по решению налоговой после купли-продажи. Код общины — той, где находится недвижимость.',
    },
    payments: [TAX('uplata', '820-13111-10', 'Porez na promet nepokretnosti', 'Porez na promet nepokretnosti')],
    notes: [{
      sr: 'Naredba 23/26 navodi i račune opština za ovaj porez. Uporedite račun sa svojim rješenjem prije uplate.',
      en: 'Naredba 23/26 also lists municipal accounts for this tax. Compare the account with your decision (rješenje) before paying.',
      ru: 'В Naredbe 23/26 есть и счета общин для этого налога. Перед оплатой сверьте счёт со своим решением (rješenje).',
    }],
    sources: [NAREDBA],
    checkedAt: '2026-10',
  },
  {
    slug: 'porez-na-upotrebu-vozila',
    category: 'taxes',
    name: { sr: 'Porez na upotrebu vozila', en: 'Vehicle use tax', ru: 'Налог на использование авто' },
    title: { sr: 'Nalog za porez na upotrebu motornih vozila', en: 'Payment order for the motor vehicle use tax', ru: 'Платёжка на налог на использование автомобиля' },
    metaDescription: {
      sr: 'Nalog za porez na upotrebu motornih vozila pri registraciji: račun 820-61117-37, model 18, JMB i šifra opštine registracije.',
      en: 'Order for the motor vehicle use tax paid at registration: account 820-61117-37, model 18, JMB and the code of the municipality of registration.',
      ru: 'Платёжка на налог на использование автомобиля при регистрации: счёт 820-61117-37, модель 18, JMB и код общины регистрации.',
    },
    intro: {
      sr: 'Plaća se pri registraciji vozila. Šifra opštine je ona u kojoj se vozilo registruje.',
      en: 'Paid when registering a vehicle. Use the code of the municipality where it is registered.',
      ru: 'Платится при регистрации автомобиля. Код общины — той, где его регистрируют.',
    },
    payments: [TAX('uplata', '820-61117-37', 'Porez na upotrebu motornih vozila\ni drugih dobara', 'Porez na upotrebu vozila')],
    notes: [{
      sr: 'Uz porez se pri registraciji plaćaju i komunalna taksa opštine i takse MUP-a.',
      en: 'Registration also involves the municipal utility fee and Ministry of Interior fees.',
      ru: 'При регистрации кроме налога платятся ещё коммунальный сбор общины и сборы МВД.',
    }],
    sources: [NAREDBA],
    checkedAt: '2026-10',
  },
  {
    slug: 'porez-na-nepokretnosti',
    category: 'local',
    name: { sr: 'Porez na nepokretnosti', en: 'Property tax', ru: 'Налог на недвижимость' },
    title: { sr: 'Nalog za porez na nepokretnosti', en: 'Payment order for property tax', ru: 'Платёжка на налог на недвижимость' },
    metaDescription: {
      sr: 'Porez na nepokretnosti za svih 25 opština: izaberite opštinu i dobićete račun, model 18 i poziv na broj.',
      en: 'Property tax for all 25 municipalities: choose one and get its account, model 18 and the reference.',
      ru: 'Налог на недвижимость для всех 25 общин: выберите свою и получите счёт, модель 18 и poziv na broj.',
    },
    intro: {
      sr: 'Porez na nepokretnosti plaća se opštini u kojoj je nepokretnost, po rješenju lokalne uprave prihoda.',
      en: 'Property tax is paid to the municipality where the property is, based on the decision of the local revenue office.',
      ru: 'Налог на недвижимость платится общине, где находится объект, по решению местного налогового органа.',
    },
    payments: [LOCAL('nepokretnosti', 'Porez na nepokretnosti', 'Porez na nepokretnosti')],
    notes: [{
      sr: 'Ako rješenje sadrži drugačiji poziv na broj, upišite onaj iz rješenja.',
      en: 'If the decision gives a different reference, use the one from the decision.',
      ru: 'Если в решении указан другой poziv na broj, пишите тот, что в решении.',
    }, {
      sr: 'Pljevlja: tekući porez plaća se na 535-5078001-23 (porez na zemljište) i 535-5078002-20 (porez na građevinske objekte). Račun 535-5078014-81 služi samo za obaveze iz ranijih godina.',
      en: 'Pljevlja: the current property tax goes to 535-5078001-23 (land tax) and 535-5078002-20 (tax on buildings). 535-5078014-81 is only for obligations from earlier years.',
      ru: 'Плевля: текущий налог платится на 535-5078001-23 (налог на землю) и 535-5078002-20 (налог на строения). Счёт 535-5078014-81 только для обязательств прошлых лет.',
    }],
    sources: [NAREDBA, PRILOZI],
    checkedAt: '2026-10',
  },
  {
    slug: 'prirez',
    category: 'local',
    name: { sr: 'Prirez porezu na dohodak', en: 'Municipal income tax surcharge', ru: 'Местная надбавка (prirez)' },
    title: { sr: 'Nalog za prirez porezu na dohodak', en: 'Payment order for the municipal income tax surcharge', ru: 'Платёжка на местную надбавку к налогу (prirez)' },
    metaDescription: {
      sr: 'Prirez porezu na dohodak za svih 25 opština: račun opštine, model 18 i poziv na broj.',
      en: 'Municipal surcharge on income tax for all 25 municipalities: account, model 18 and reference.',
      ru: 'Местная надбавка к налогу на доходы для всех 25 общин: счёт общины, модель 18 и poziv na broj.',
    },
    intro: {
      sr: 'Prirez se plaća opštini prebivališta zaposlenog, uz porez na dohodak.',
      en: 'The surcharge is paid, together with income tax, to the municipality where the employee lives.',
      ru: 'Надбавка платится вместе с налогом на доходы общине, где живёт работник.',
    },
    payments: [LOCAL('prirez', 'Prirez porezu na dohodak', 'Prirez porezu na dohodak')],
    notes: [],
    sources: [NAREDBA, PRILOZI],
    checkedAt: '2026-10',
  },
  {
    slug: 'boravisna-taksa',
    category: 'local',
    name: { sr: 'Boravišna taksa', en: 'Tourist tax', ru: 'Туристический сбор' },
    title: { sr: 'Nalog za boravišnu taksu', en: 'Payment order for the tourist tax (boravišna taksa)', ru: 'Платёжка на туристический сбор (boravišna taksa)' },
    metaDescription: {
      sr: 'Boravišna taksa po opštinama za izdavaoce smještaja: račun opštine, model 18, PIB ili JMB i šifra opštine.',
      en: 'Tourist tax by municipality for accommodation hosts: account, model 18, PIB or JMB and municipality code.',
      ru: 'Туристический сбор по общинам для арендодателей жилья: счёт общины, модель 18, PIB или JMB и код общины.',
    },
    intro: {
      sr: 'Boravišnu taksu naplaćuju izdavaoci smještaja od gostiju i uplaćuju je opštini u kojoj je smještaj.',
      en: 'Hosts collect the tourist tax from guests and pay it to the municipality where the accommodation is.',
      ru: 'Туристический сбор арендодатели берут с гостей и перечисляют общине, где находится жильё.',
    },
    payments: [LOCAL('boravisna', 'Boravišna taksa', 'Boravišna taksa')],
    notes: [{
      sr: 'Petnjica nema poseban račun boravišne takse u Naredbi. Nacionalna turistička organizacija ima račun 832-3205-88.',
      en: 'Petnjica has no tourist tax account in the order. The National Tourism Organisation account is 832-3205-88.',
      ru: 'У Петницы нет отдельного счёта туристического сбора. Счёт Национальной туристической организации: 832-3205-88.',
    }],
    sources: [NAREDBA, PRILOZI],
    checkedAt: '2026-10',
  },
  {
    slug: 'lokalne-administrativne-takse',
    category: 'local',
    name: { sr: 'Lokalne administrativne takse', en: 'Local administrative fees', ru: 'Местные админ. сборы' },
    title: { sr: 'Nalog za lokalne administrativne takse', en: 'Payment order for local administrative fees', ru: 'Платёжка на местные административные сборы' },
    metaDescription: {
      sr: 'Lokalne administrativne takse za svih 25 opština: račun opštine, model 18 i poziv na broj.',
      en: 'Local administrative fees for all 25 municipalities: account, model 18 and reference.',
      ru: 'Местные административные сборы для всех 25 общин: счёт общины, модель 18 и poziv na broj.',
    },
    intro: {
      sr: 'Takse za zahtjeve, uvjerenja i rješenja organa opštine. Iznos zavisi od odluke opštine.',
      en: 'Fees for applications, certificates and decisions of municipal bodies. The amount depends on the municipality.',
      ru: 'Сборы за заявления, справки и решения органов общины. Сумма зависит от решения общины.',
    },
    payments: [LOCAL('adminTakse', 'Lokalne administrativne takse', 'Lokalna administrativna taksa')],
    notes: [],
    sources: [NAREDBA, PRILOZI],
    checkedAt: '2026-10',
  },
  {
    slug: 'saobracajna-kazna',
    category: 'fines',
    name: { sr: 'Saobraćajna kazna', en: 'Traffic fine', ru: 'Штраф ПДД' },
    title: { sr: 'Nalog za plaćanje saobraćajne kazne', en: 'Payment order for a traffic fine', ru: 'Платёжка на штраф ПДД' },
    metaDescription: {
      sr: 'Plaćanje kazne po prekršajnom nalogu policije: šifra 300, zaduženje 05 i broj naloga, odobrenje 18 i JMB-003.',
      en: 'Paying a police penalty notice: code 300, debit 05 and the notice number, credit 18 and JMB-003.',
      ru: 'Оплата штрафа по протоколу полиции: код 300, задолженность 05 и номер протокола, одобрение 18 и JMB-003.',
    },
    intro: {
      sr: 'Kazne po Zakonu o bezbjednosti saobraćaja koje izriče policija. U zaduženje ide broj prekršajnog naloga (10 cifara), u odobrenje JMB i šifra prihoda 003.',
      en: 'Fines under the Road Traffic Safety Act issued by the police. The debit reference is the 10-digit penalty notice number, the credit one your JMB and revenue code 003.',
      ru: 'Штрафы по Закону о безопасности дорожного движения, выписанные полицией. В задолженность пишется 10-значный номер протокола, в одобрение ваш JMB и код дохода 003.',
    },
    payments: [{
      id: 'kazna',
      label: { sr: 'Kazna', en: 'Fine', ru: 'Штраф' },
      preset: {
        account: '840-80-82',
        payee: 'Uprava policije\nNovčane kazne',
        purpose: 'Novčana kazna po prekršajnom nalogu',
        paymentCode: '300',
        debitModel: '05',
        model: '18',
      },
      referenceHint: {
        sr: 'Zaduženje: model 05 i broj prekršajnog naloga. Odobrenje: model 18, JMB-003 (za „pauk” 004).',
        en: 'Debit: model 05 and the penalty notice number. Credit: model 18, JMB-003 (004 for towing).',
        ru: 'Задолженность: модель 05 и номер протокола. Одобрение: модель 18, JMB-003 (для эвакуатора 004).',
      },
      tool: { code: '003' },
    }],
    notes: [FINE_NOTE, {
      sr: 'Kazne koje izrekne sud za prekršaje plaćaju se na račun tog suda (832-7160-57 Podgorica, 832-7161-54 Bijelo Polje, 832-7163-48 Budva).',
      en: 'Fines imposed by a misdemeanour court go to that court’s account (832-7160-57 Podgorica, 832-7161-54 Bijelo Polje, 832-7163-48 Budva).',
      ru: 'Штрафы, назначенные судом по правонарушениям, платятся на счёт этого суда (832-7160-57 Подгорица, 832-7161-54 Бело-Поле, 832-7163-48 Будва).',
    }],
    sources: [NAREDBA, PRILOZI],
    checkedAt: '2026-10',
  },
  {
    slug: 'kazna-lokalne-samouprave',
    category: 'fines',
    name: { sr: 'Kazna komunalne policije', en: 'Municipal fine', ru: 'Штраф общины' },
    title: { sr: 'Nalog za kaznu organa lokalne samouprave', en: 'Payment order for a municipal fine', ru: 'Платёжка на штраф органа общины' },
    metaDescription: {
      sr: 'Kazne komunalne policije i inspekcija opštine: račun 832-20000-46, šifra 300, model 18, JMB i šifra opštine.',
      en: 'Fines of municipal wardens and inspectors: account 832-20000-46, code 300, model 18, JMB and municipality code.',
      ru: 'Штрафы коммунальной полиции и инспекций общины: счёт 832-20000-46, код 300, модель 18, JMB и код общины.',
    },
    intro: {
      sr: 'Novčane kazne koje izriču organi lokalne samouprave (komunalna policija, inspekcije). U zaduženje ide broj prekršajnog naloga.',
      en: 'Fines imposed by municipal bodies (municipal wardens, inspectors). The debit reference is the penalty notice number.',
      ru: 'Штрафы органов местного самоуправления (коммунальная полиция, инспекции). В задолженность пишется номер протокола.',
    },
    payments: [{
      id: 'kazna',
      label: { sr: 'Kazna', en: 'Fine', ru: 'Штраф' },
      preset: {
        account: '832-20000-46',
        payee: 'Novčane kazne koje izriču\njedinice lokalne samouprave',
        purpose: 'Novčana kazna po prekršajnom nalogu',
        paymentCode: '300',
        model: '18',
      },
      referenceHint: {
        sr: 'Zaduženje: broj prekršajnog naloga. Odobrenje: model 18, JMB ili PIB i šifra opštine.',
        en: 'Debit: the penalty notice number. Credit: model 18, JMB or PIB and the municipality code.',
        ru: 'Задолженность: номер протокола. Одобрение: модель 18, JMB или PIB и код общины.',
      },
      tool: {},
    }],
    notes: [FINE_NOTE],
    sources: [NAREDBA, PRILOZI],
    checkedAt: '2026-10',
  },
  {
    slug: 'licna-karta',
    category: 'documents',
    name: { sr: 'Lična karta', en: 'ID card', ru: 'Личная карта (ID)' },
    title: { sr: 'Nalog za plaćanje lične karte', en: 'Payment order for an ID card', ru: 'Платёжка на личную карту (ID)' },
    metaDescription: {
      sr: 'Obrazac lične karte 5,00 EUR: račun MUP-a 825-42-95, model 05. Poziv na broj dobijate na šalteru.',
      en: 'ID card form 5.00 EUR: Ministry of Interior account 825-42-95, model 05. The reference is given at the counter.',
      ru: 'Бланк личной карты 5,00 EUR: счёт МВД 825-42-95, модель 05. Poziv na broj дают в окошке.',
    },
    intro: {
      sr: 'Obrazac lične karte plaća se Ministarstvu unutrašnjih poslova, na račun prihoda od izdavanja isprava.',
      en: 'The ID card form is paid to the Ministry of Interior, to the account for issuing documents.',
      ru: 'Бланк личной карты оплачивается МВД на счёт доходов от выдачи документов.',
    },
    payments: [{
      id: 'obrazac',
      label: { sr: 'Obrazac', en: 'Form', ru: 'Бланк' },
      preset: { account: '825-42-95', payee: 'Ministarstvo unutrašnjih poslova\nPrihodi od izdavanja isprava', purpose: 'Obrazac lične karte', amount: '5,00', model: '05' },
      referenceHint: MUP_REFERENCE,
    }],
    fees: [{ label: { sr: 'Obrazac lične karte', en: 'ID card form', ru: 'Бланк личной карты' }, amount: 5 }],
    notes: [],
    sources: [NAREDBA, MUP_ID],
    checkedAt: '2026-10',
  },
  {
    slug: 'pasos',
    category: 'documents',
    name: { sr: 'Pasoš', en: 'Passport', ru: 'Паспорт' },
    title: { sr: 'Nalozi za plaćanje pasoša', en: 'Payment orders for a passport', ru: 'Платёжки на паспорт' },
    metaDescription: {
      sr: 'Pasoš: obrazac 8,00 EUR na 825-42-95 i administrativna taksa 25,00 EUR na 825-55-56, model 05.',
      en: 'Passport: form 8.00 EUR to 825-42-95 and administrative fee 25.00 EUR to 825-55-56, model 05.',
      ru: 'Паспорт: бланк 8,00 EUR на 825-42-95 и административный сбор 25,00 EUR на 825-55-56, модель 05.',
    },
    intro: {
      sr: 'Za pasoš se plaćaju dva naloga: obrazac i administrativna taksa. Oba na račune MUP-a, model 05.',
      en: 'A passport takes two orders: the form and the administrative fee. Both go to Ministry of Interior accounts, model 05.',
      ru: 'За паспорт платятся две платёжки: бланк и административный сбор. Обе на счета МВД, модель 05.',
    },
    payments: [
      {
        id: 'obrazac',
        label: { sr: 'Obrazac', en: 'Form', ru: 'Бланк' },
        preset: { account: '825-42-95', payee: 'Ministarstvo unutrašnjih poslova\nPrihodi od izdavanja isprava', purpose: 'Obrazac pasoša', amount: '8,00', model: '05' },
        referenceHint: MUP_REFERENCE,
      },
      {
        id: 'taksa',
        label: { sr: 'Administrativna taksa', en: 'Administrative fee', ru: 'Админ. сбор' },
        preset: { account: '825-55-56', payee: 'Ministarstvo unutrašnjih poslova\nAdministrativna taksa', purpose: 'Administrativna taksa za pasoš', amount: '25,00', model: '05' },
        referenceHint: MUP_REFERENCE,
      },
    ],
    fees: [
      { label: { sr: 'Obrazac pasoša', en: 'Passport form', ru: 'Бланк паспорта' }, amount: 8 },
      { label: { sr: 'Administrativna taksa', en: 'Administrative fee', ru: 'Административный сбор' }, amount: 25 },
    ],
    notes: [{
      sr: 'Lica do 21 godine ne plaćaju administrativnu taksu od 25 EUR. Račun takse 825-55-56 je iz Naredbe; ako vam na šalteru kažu drugi, platite na njega.',
      en: 'People under 21 do not pay the 25 EUR administrative fee. The fee account 825-55-56 comes from the Naredba; if the counter staff name a different one, pay to that.',
      ru: 'Лица до 21 года не платят административный сбор 25 EUR. Счёт сбора 825-55-56 взят из Naredbe; если в окошке назовут другой, платите на него.',
    }],
    sources: [NAREDBA, MUP_PASSPORT],
    checkedAt: '2026-10',
  },
  {
    slug: 'boravak-stranaca',
    category: 'documents',
    name: { sr: 'Boravak stranaca', en: 'Residence for foreigners', ru: 'ВНЖ для иностранцев' },
    title: { sr: 'Nalozi za plaćanje privremenog boravka stranaca', en: 'Payment orders for a foreigner’s temporary residence', ru: 'Платёжки на временное проживание иностранца' },
    metaDescription: {
      sr: 'Boravak stranaca: zahtjev 2,00 EUR na 825-50-71, taksa (20–60 EUR) i obrazac 5,00 EUR na 825-42-95, model 05.',
      en: 'Foreigners’ residence: application 2.00 EUR to 825-50-71, fee (20–60 EUR) and form 5.00 EUR to 825-42-95, model 05.',
      ru: 'ВНЖ иностранца: заявление 2,00 EUR на 825-50-71, сбор (20–60 EUR) и бланк 5,00 EUR на 825-42-95, модель 05.',
    },
    intro: {
      sr: 'Za dozvolu za privremeni boravak ili boravak i rad plaćaju se tri naloga: zahtjev, administrativna taksa i obrazac dozvole. Svi idu na račune MUP-a, model 05.',
      en: 'A temporary residence or residence-and-work permit takes three orders: the application, the administrative fee and the permit form. All go to Ministry of Interior accounts, model 05.',
      ru: 'За разрешение на временное проживание или проживание и работу платятся три платёжки: заявление, административный сбор и бланк разрешения. Все на счета МВД, модель 05.',
    },
    payments: [
      {
        id: 'zahtjev',
        label: { sr: 'Zahtjev', en: 'Application', ru: 'Заявление' },
        preset: { account: '825-50-71', payee: 'Ministarstvo unutrašnjih poslova\nOstali prihodi', purpose: 'Zahtjev za privremeni boravak', amount: '2,00', model: '05' },
        referenceHint: MUP_REFERENCE,
      },
      {
        id: 'taksa',
        label: { sr: 'Administrativna taksa', en: 'Administrative fee', ru: 'Админ. сбор' },
        preset: { account: '825-42-95', payee: 'Ministarstvo unutrašnjih poslova\nPrihodi od izdavanja isprava', purpose: 'Administrativna taksa za boravak', amount: '', model: '05' },
        referenceHint: MUP_REFERENCE,
        amountNote: {
          sr: 'Prvi privremeni boravak i rad 60 EUR, produženje 30 EUR; spajanje porodice ili boravak po osnovu nekretnine (prvi put) 40 EUR, produženje spajanja porodice 20 EUR; učenici i studenti ne plaćaju taksu.',
          en: 'First temporary residence and work permit 60 EUR, extension 30 EUR; family reunification or residence based on property (first issue) 40 EUR, extension of family reunification 20 EUR; students pay no fee.',
          ru: 'Первое временное проживание и работа 60 EUR, продление 30 EUR; воссоединение семьи или проживание по недвижимости (первая выдача) 40 EUR, продление воссоединения семьи 20 EUR; студенты и учащиеся сбор не платят.',
        },
      },
      {
        id: 'obrazac',
        label: { sr: 'Obrazac dozvole', en: 'Permit form', ru: 'Бланк разрешения' },
        preset: { account: '825-42-95', payee: 'Ministarstvo unutrašnjih poslova\nPrihodi od izdavanja isprava', purpose: 'Obrazac dozvole za boravak', amount: '5,00', model: '05' },
        referenceHint: MUP_REFERENCE,
      },
    ],
    fees: [
      { label: { sr: 'Zahtjev', en: 'Application', ru: 'Заявление' }, amount: 2 },
      { label: { sr: 'Taksa: prvi boravak i rad', en: 'Fee: first residence and work', ru: 'Сбор: первое проживание и работа' }, amount: 60 },
      { label: { sr: 'Taksa: produženje boravka i rada', en: 'Fee: residence and work extension', ru: 'Сбор: продление проживания и работы' }, amount: 30 },
      { label: { sr: 'Taksa: porodica ili nekretnina (prvi put)', en: 'Fee: family or property (first issue)', ru: 'Сбор: семья или недвижимость (первая выдача)' }, amount: 40 },
      { label: { sr: 'Taksa: produženje, porodica', en: 'Fee: family extension', ru: 'Сбор: продление по семье' }, amount: 20 },
      { label: { sr: 'Obrazac dozvole', en: 'Permit form', ru: 'Бланк разрешения' }, amount: 5 },
    ],
    notes: [
      {
        sr: 'Iznosi i računi potiču iz Zakona o administrativnim taksama (tarifni broj 13) i državnih informativnih stranica. Biznis portal za zahtjev navodi 5,00 EUR; ako vam na šalteru kažu drugi iznos ili račun, platite kako kažu.',
        en: 'Amounts and accounts come from the Law on Administrative Fees (tariff no. 13) and government information pages. The biznis portal lists 5.00 EUR for the application; if the counter names a different amount or account, pay as they say.',
        ru: 'Суммы и счета взяты из Zakona o administrativnim taksama (тарифный номер 13) и государственных информационных страниц. Портал biznis.gov.me для заявления указывает 5,00 EUR; если в окошке назовут другую сумму или счёт, платите так, как скажут.',
      },
      {
        sr: 'Pri elektronskom podnošenju zahtjeva taksa se plaća preko sistema za elektronsku naplatu administrativnih taksi. Ovaj nalog služi za plaćanje u banci ili na pošti.',
        en: 'When you apply online, the fee is paid through the electronic payment system for administrative fees. This order is for paying at a bank or post office.',
        ru: 'При подаче заявления онлайн сбор платится через систему электронной оплаты административных сборов. Эта платёжка нужна для оплаты в банке или на почте.',
      },
      {
        sr: 'Za boravak po osnovu nekretnine od 2026. potrebna je nepokretnost čija je osnovica poreza na promet najmanje 150.000 EUR (Sl. list CG 3/26).',
        en: 'Residence based on property now requires a property whose transfer-tax base is at least 150,000 EUR (Sl. list CG 3/26).',
        ru: 'Для проживания по недвижимости с 2026 года нужна недвижимость с базой налога на оборот не менее 150 000 EUR (Sl. list CG 3/26).',
      },
    ],
    sources: [
      { label: 'ZZZCG: privremena dozvola za boravak i rad stranaca', url: 'https://www.zzzcg.me/privremena-dozvola-za-boravak-i-rad-stranaca/' },
      { label: 'MUP: privremeni boravak i rad, radna dozvola', url: 'https://psc.gov.me/me/sektorske-informacije/ministarstvo-unutrasnjih-poslova/privremeni-boravak-i-rad-radna-dozvola' },
      { label: 'biznis.gov.me: boravak za strance', url: 'https://biznis.gov.me/vodici-i-informacije/boravak-za-strance-na-osnovu-zaposlenja-sezonskog-rada-ili-prekogranicnih-usluga-6' },
      { label: 'Zakon o administrativnim taksama, tarifni broj 13', url: 'https://wapi.gov.me/download/301e146a-19a5-4b03-9fde-c6b6b56b2d00?version=1.0' },
      { label: 'Zakon o izmjenama i dopunama Zakona o strancima (Sl. list CG 3/26)', url: 'https://www.sluzbenilist.me/propisi/389913' },
    ],
    checkedAt: '2026-10',
  },
]

export const findTemplate = (slug: string) => TEMPLATES.find(t => t.slug === slug)
