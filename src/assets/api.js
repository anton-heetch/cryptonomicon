const API_KEY = '0a2ae2b928cc47a8536d9f2eb147f86d5d3163bb823e226897b40ae6fe5036a4'

const tickersHandlers = new Map()

//TODO: refactor URLSearchParams
const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return
  }
  
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys()
    ].join(',')}&tsyms=USD&api_key=${API_KEY}`
  )
    .then(r => r.json())
    .then(rawData => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      )
      
      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? []
        handlers.forEach(fn => fn(newPrice))
      })
    })
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, cb])
}

export const unsubscribeFromTicker = ticker => {
  // const subscribers = tickersHandlers.get(ticker) || []
  // tickersHandlers.set(ticker, subscribers.filter(fn => fn !== cb))
  tickersHandlers.delete(ticker)
}

setInterval(loadTickers, 5000)
window.tickersHandlers = tickersHandlers