import ccxt from 'ccxt'

const binance = new ccxt.binance() // Replace with your desired exchange

export const getUniqueCurrencySymbols = async () => {
  try {
    const markets = await binance.fetchMarkets()
    const uniqueSymbols = new Set()

    // Extract unique base and quote currency symbols
    markets.forEach((market) => {
      const base = market?.base
      uniqueSymbols.add(base)
    })

    // Convert Set to an array
    const availableSymbolsArray = Array.from(uniqueSymbols) as string[]
    return availableSymbolsArray
  } catch (error) {
    console.error('Error fetching available symbols:', error.message)
  }
}

export const getConvertRate = async (
  from: string | undefined,
  to: string | undefined
) => {
  try {
    let rate: number | null = null

    const markets = await binance.fetchMarkets()
    const availableRate = markets.filter((e) => e?.base === from)

    if (availableRate.filter((e) => e?.quote === to).length) {
      const ticker = await binance.fetchTicker(`${from}/${to}`)
      rate = Number(ticker.last) // Last traded price
    } else {
      const toRate = markets.filter((e) => e?.base === to)

      const intermediaryToken = availableRate
        .map((e) => e?.quote)
        .filter((value) => toRate.map((e) => e?.quote).includes(value))
        .at(0)

      if (intermediaryToken) {
        const fromIntermediaryRate = await binance.fetchTicker(
          `${from}/${intermediaryToken}`
        )
        const toIntermediaryRate = await binance.fetchTicker(
          `${to}/${intermediaryToken}`
        )

        const fromIntermediaryRateLast = fromIntermediaryRate.last
          ? fromIntermediaryRate.last
          : fromIntermediaryRate.previousClose
        const toIntermediaryRateLast = toIntermediaryRate.last
          ? toIntermediaryRate.last
          : toIntermediaryRate.previousClose

        if (fromIntermediaryRateLast && toIntermediaryRateLast) {
          rate = fromIntermediaryRateLast / toIntermediaryRateLast
        }
      }
    }

    return rate
  } catch (error) {
    console.error('Error fetching ticker:', error.message)
  }
}
