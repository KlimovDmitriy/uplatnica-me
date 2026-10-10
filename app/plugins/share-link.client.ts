/**
 * Shared links: "/#n=…" (see utils/share.ts). The slip is read from the address bar before the app
 * starts, because hydrating a prerendered page briefly replaces the URL with the payload path (no
 * hash) and restores it only after the page has mounted. The generator takes the slip from
 * useSharedSlip() when it mounts. The hash is then dropped through the router, so the router's own
 * URL restore cannot bring it back; links opened later in the same tab go the same way.
 */
export default defineNuxtPlugin({
  name: 'uplatnica-me:share-link',
  setup() {
    const shared = useSharedSlip()
    const router = useRouter()

    let arrival = window.location.hash
    const slip = slipFromHash(arrival)
    if (slip) shared.value = slip
    if (slip === undefined) arrival = ''

    router.beforeEach((to) => {
      const next = slipFromHash(to.hash)
      if (next === undefined) return
      // The router putting back the URL we arrived with: that slip is already taken.
      if (to.hash === arrival) arrival = ''
      else if (next) shared.value = next
      return { path: to.path, query: to.query, hash: '', replace: true }
    })

    // In case nothing navigated after hydration and the hash is still in the URL.
    onNuxtReady(() => {
      const { path, query, hash } = router.currentRoute.value
      if (slipFromHash(hash) === undefined) return
      arrival = ''
      router.replace({ path, query, hash: '' })
    })
  },
})
