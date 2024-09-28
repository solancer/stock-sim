import React, { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sheet, SheetContent } from '@/components/ui/sheet'

import Header from '@/components/Header'
import StockSimulator from '@/components/StockSimulator'
import RunningSimulations from '@/components/RunningSimulations'
import AddStockForm from '@/components/AddStockForm'

export default function App() {
  const [stockData, setStockData] = useState({})
  const [availableStocks, setAvailableStocks] = useState(['AAPL', 'GOOGL', 'AMZN'])
  const [selectedStock, setSelectedStock] = useState('AAPL')
  const [isAddStockOpen, setIsAddStockOpen] = useState(false)
  const [customStocks, setCustomStocks] = useState({})
  const [runningSimulations, setRunningSimulations] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [marketSummary, setMarketSummary] = useState({
    topPerformer: 'AAPL',
    totalVolume: '1.2M',
    marketHours: '9:30 AM - 4:00 PM EST'
  })

  // Add newStock state to manage form input
  const [newStock, setNewStock] = useState({
    symbol: '',
    initialPrice: '',
    expectedReturn: '',
    volatility: ''
  })

  const handleStartSimulation = () => {
    setIsLoading(true)
    setTimeout(() => {
      createWorkerWindow()
      setIsLoading(false)
    }, 1500)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewStock((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddStock = (e) => {
    e.preventDefault()
    const { symbol, initialPrice, expectedReturn, volatility } = newStock
    const upperSymbol = symbol.toUpperCase()
    setAvailableStocks((prev) => [...prev, upperSymbol])
    setCustomStocks((prev) => ({
      ...prev,
      [upperSymbol]: {
        initialPrice: parseFloat(initialPrice),
        expectedReturn: parseFloat(expectedReturn),
        volatility: parseFloat(volatility),
      },
    }))
    setNewStock({ symbol: '', initialPrice: '', expectedReturn: '', volatility: '' }) // Clear the form after submission
    setIsAddStockOpen(false)
  }

  const stopSimulation = useCallback((stockSymbol) => {
    const workerWindow = runningSimulations[stockSymbol]
    if (workerWindow && !workerWindow.closed) {
      workerWindow.postMessage({ type: 'STOP_SIMULATION' }, '*')
      setTimeout(() => {
        workerWindow.close()
        setRunningSimulations((prev) => {
          const newSimulations = { ...prev }
          delete newSimulations[stockSymbol]
          return newSimulations
        })
      }, 500)
    }
  }, [runningSimulations])

  const createWorkerWindow = useCallback(() => {
    const workerId = `worker-${Date.now()}`
    const stockSymbol = selectedStock

    if (runningSimulations[stockSymbol]) {
      alert(`A simulation for ${stockSymbol} is already running.`)
      return
    }

    const stockParams = customStocks[stockSymbol] || {}

    const queryParams = new URLSearchParams({
      id: workerId,
      stock: stockSymbol,
      initialPrice: stockParams.initialPrice != null ? stockParams.initialPrice : '',
      expectedReturn: stockParams.expectedReturn != null ? stockParams.expectedReturn : '',
      volatility: stockParams.volatility != null ? stockParams.volatility : '',
    })

    const windowWidth = 550
    const windowHeight = 650
    const screenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX
    const screenTop = window.screenTop !== undefined ? window.screenTop : window.screenY

    const leftPosition = screenLeft + (Object.keys(runningSimulations).length % 3) * (windowWidth + 10)
    const topPosition = screenTop + Math.floor(Object.keys(runningSimulations).length / 3) * (windowHeight + 30)

    // Use window.location.origin to get the base URL dynamically
    const baseUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
    const workerUrl = new URL('worker.html', baseUrl);
    workerUrl.search = queryParams.toString();

    const workerWindowFeatures = `width=${windowWidth},height=${windowHeight},left=${leftPosition},top=${topPosition}`;

    const workerWindow = window.open(
      workerUrl.toString(),
      '_blank',
      workerWindowFeatures,
    );

    if (workerWindow) {
      workerWindow.name = workerId
      setRunningSimulations((prev) => ({ ...prev, [stockSymbol]: workerWindow }))
    } else {
      alert('Please allow pop-ups for this application.')
    }
  }, [selectedStock, customStocks, runningSimulations])

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return

      const { data } = event

      if (data.type === 'SIMULATION_ENDED') {
        const { stockSymbol } = data.payload
        setRunningSimulations((prevSimulations) => {
          const newSimulations = { ...prevSimulations }
          delete newSimulations[stockSymbol]
          return newSimulations
        })
      }

      if (data.type === 'STOCK_UPDATE') {
        const { stockSymbol, stockUpdate } = data.payload
        const { time, price } = stockUpdate

        if (!time || isNaN(new Date(time).getTime()) || price == null || isNaN(price)) {
          console.warn('Invalid stock update:', { time, price })
          return
        }

        setStockData((prevData) => ({
          ...prevData,
          [stockSymbol]: [...(prevData[stockSymbol] || []), { time, price }],
        }))
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRunningSimulations((prevSimulations) => {
        const newSimulations = { ...prevSimulations }
        let hasChanges = false
        Object.keys(prevSimulations).forEach((stockSymbol) => {
          const workerWindow = prevSimulations[stockSymbol]
          if (workerWindow.closed) {
            delete newSimulations[stockSymbol]
            hasChanges = true
          }
        })
        return hasChanges ? newSimulations : prevSimulations
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [runningSimulations])

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        <Header onAddStockClick={() => setIsAddStockOpen(true)} />

        <Tabs defaultValue="simulator" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100">
            <TabsTrigger value="simulator" className="data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-300">Simulator</TabsTrigger>
            <TabsTrigger value="running" className="data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-300">Running Simulations</TabsTrigger>
          </TabsList>

          <TabsContent value="simulator">
            <StockSimulator
              stockData={stockData}
              availableStocks={availableStocks}
              selectedStock={selectedStock}
              setSelectedStock={setSelectedStock}
              handleStartSimulation={handleStartSimulation}
              isLoading={isLoading}
              marketSummary={marketSummary}
            />
          </TabsContent>

          <TabsContent value="running">
            <RunningSimulations
              runningSimulations={runningSimulations}
              stopSimulation={stopSimulation}
            />
          </TabsContent>
        </Tabs>

        <Sheet open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
          <SheetContent className="bg-white text-black">
            <AddStockForm
              isOpen={isAddStockOpen}
              onOpenChange={setIsAddStockOpen}
              newStock={newStock}
              handleInputChange={handleInputChange}
              handleAddStock={handleAddStock}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
