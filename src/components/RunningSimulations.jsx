import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const RunningSimulations = ({ runningSimulations, stopSimulation }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="text-black">Running Simulations</CardTitle>
                </CardHeader>
                <CardContent>
                    {Object.keys(runningSimulations).length === 0 ? (
                        <p className="text-gray-600">No simulations are currently running.</p>
                    ) : (
                        <ul className="space-y-2">
                            {Object.keys(runningSimulations).map((stockSymbol) => (
                                <motion.li
                                    key={stockSymbol}
                                    className="flex items-center justify-between bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <span className="font-semibold text-black">{stockSymbol}</span>
                                    <Button
                                        variant="destructive"
                                        onClick={() => stopSimulation(stockSymbol)}
                                        className="bg-black hover:bg-gray-800 text-white transition-all duration-300 ease-in-out transform hover:scale-105"
                                    >
                                        Stop Simulation
                                    </Button>
                                </motion.li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default RunningSimulations