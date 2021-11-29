const API_KEY = 'a9d18c7e8398d373afc62dee88660560c5a4274d01a6aaf053656afa9ba0220b'
// const SOCKET_API_KEY = '0a2ae2b928cc47a8536d9f2eb147f86d5d3163bb823e226897b40ae6fe5036a4'

const tickersHandlers = new Map()
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
)

const AGGREGATE_INDEX = "5";

socket.addEventListener('message', e => {
  const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data)
  if(type !== AGGREGATE_INDEX || newPrice === undefined) {
    return
  }
  
  const handlers = tickersHandlers.get(currency) ?? []
  handlers.forEach(fn => fn(newPrice))
})


function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message)
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage)
    return
  }
  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage)
    },
    {once: true}
  )
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket(
    {
      "action": "SubAdd",
      subs: [`5~CCCAGG~${ticker}~USD`]
    }
  )
}
function unSubscribeFromTickerOnWs(ticker) {
  sendToWebSocket(
    {
      "action": "SubRemove",
      subs: [`5~CCCAGG~${ticker}~USD`]
    }
  )
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, cb])
  subscribeToTickerOnWs(ticker)
}

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker)
  unSubscribeFromTickerOnWs(ticker)
}

window.tickersHandlers = tickersHandlers