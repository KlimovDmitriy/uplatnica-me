# Uplatnica CG

Free generator of Montenegrin payment orders (nalog za plaćanje), built to the CBCG rules. Ready-made orders for taxes, contributions and fees, a model 18 reference builder, and an account/IBAN check. Everything runs in the browser; no data is sent to a server. Montenegro has no payment QR standard yet, so the order has no QR.

Languages: Montenegrin, English, Russian.

## Stack

Nuxt 4 (static, `nuxt generate`), Vue 3, TypeScript, `@nuxtjs/i18n`, `qrcode`, `jspdf`, Vitest.

## Development

```sh
npm i
npm run dev        # dev server
npm test           # unit tests
npm run generate   # static site in .output/public
```

## Configuration

Settings are read at build time from `NUXT_PUBLIC_*` environment variables. Copy `.env.example` to `.env` and fill in what you need; every variable is documented there. Empty values are ignored.

| Variable | Purpose |
| --- | --- |
| `NUXT_PUBLIC_SITE_URL` | Production domain (canonical, hreflang, sitemap, robots) |
| `NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `_YANDEX_VERIFICATION` | Search engine verification |
| `NUXT_PUBLIC_PLAUSIBLE_DOMAIN`, `_PLAUSIBLE_SRC` | Optional Plausible analytics |
| `NUXT_PUBLIC_DONATE_SEPA_IBAN`, `_SEPA_BIC`, `_SEPA_NAME`, `_SEPA_BANK` | SEPA transfer in EUR with an EPC QR code (bank name optional) |
| `NUXT_PUBLIC_DONATE_KOFI`, `_GITHUB_SPONSORS` | Card donation links (https URLs) |
| `NUXT_PUBLIC_DONATE_CRYPTO_TRON`, `_TON`, `_SOLANA`, `_EVM` | Stablecoin addresses, one per network family |

Donation methods with no value are hidden; with none set, the donate button disappears.

## License

[MIT](LICENSE)
