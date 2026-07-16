const XLM_PRICE_CACHE_KEY = 'xlm-price-cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function fetchXLMPrice() {
  try {
    // Check cache first
    const cached = localStorage.getItem(XLM_PRICE_CACHE_KEY)
    if (cached) {
      const { price, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_DURATION) {
        return price
      }
    }

    // Fetch from CoinGecko API (free, no API key required)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd,eur,gbp,btc,eth'
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch price')
    }

    const data = await response.json()
    const priceData = data.stellar
    
    // Cache the result
    localStorage.setItem(
      XLM_PRICE_CACHE_KEY,
      JSON.stringify({ price: priceData, timestamp: Date.now() })
    )
    
    return priceData
  } catch (error) {
    console.error('Error fetching XLM price:', error)
    return null
  }
}

export function formatPrice(price, currency = 'USD') {
  if (!price) return 'N/A'
  
  const currencySymbols = {
    usd: '$',
    eur: '€',
    gbp: '£',
    btc: '₿',
    eth: 'Ξ'
  }
  
  const symbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase()
  const value = price[currency.toLowerCase()]
  
  if (value === undefined) return 'N/A'
  
  // Format based on currency type
  if (currency.toLowerCase() === 'btc' || currency.toLowerCase() === 'eth') {
    return `${symbol}${value.toFixed(8)}`
  }
  
  return `${symbol}${value.toFixed(4)}`
}

export function convertXLMToUSD(xlmAmount, priceData) {
  if (!priceData || !priceData.usd) return null
  return xlmAmount * priceData.usd
}
