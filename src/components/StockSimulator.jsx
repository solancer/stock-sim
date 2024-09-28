import React from 'react'
import { motion } from 'framer-motion'
import { LineChart, RefreshCw, TrendingUp, Activity, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import StockChart from './StockChart'

const StockSimulator = ({
    selectedStock,
    setSelectedStock,
    availableStocks,
    handleStartSimulation,
    isLoading,
    stockData,
    marketSummary
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center text-black">
                        <LineChart className="h-6 w-6 mr-2 text-black" />
                        Stock Simulator
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-4 mb-6">
                        <Select onValueChange={(value) => setSelectedStock(value)} value={selectedStock}>
                            <SelectTrigger className="w-[200px] bg-white border-gray-300 text-black hover:border-black transition-colors duration-300">
                                <SelectValue placeholder="Select Stock Symbol" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300 text-black">
                                <SelectGroup>
                                    <SelectLabel>Available Stocks</SelectLabel>
                                    {availableStocks.map((stock) => (
                                        <SelectItem key={stock} value={stock}>{stock}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleStartSimulation}
                            className="bg-black hover:bg-gray-800 text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                                'Start Simulation'
                            )}
                        </Button>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 hover:shadow-md transition-shadow duration-300">
                        <StockChart data={stockData} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Card className="bg-gray-100 hover:bg-gray-200 transition-colors duration-300">
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div className="flex items-center">
                                                <TrendingUp className="h-6 w-6 mr-2 text-black" />
                                                <span className="font-semibold">Top Performer</span>
                                            </div>
                                            <span className="text-black font-bold">{marketSummary.topPerformer}</span>
                                        </CardContent>
                                    </Card>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Top performing stock today</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Card className="bg-gray-100 hover:bg-gray-200 transition-colors duration-300">
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div className="flex items-center">
                                                <Activity className="h-6 w-6 mr-2 text-black" />
                                                <span className="font-semibold">Total Volume</span>
                                            </div>
                                            <span className="text-black font-bold">{marketSummary.totalVolume}</span>
                                        </CardContent>
                                    </Card>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Total trading volume today</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Card className="bg-gray-100 hover:bg-gray-200 transition-colors duration-300">
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div className="flex items-center">
                                                <Clock className="h-6 w-6 mr-2 text-black" />
                                                <span className="font-semibold">Market Hours</span>
                                            </div>
                                            <span className="text-black font-bold">{marketSummary.marketHours}</span>
                                        </CardContent>
                                    </Card>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Current market hours</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default StockSimulator