import React from 'react'
import { motion } from 'framer-motion'
import { BarChart, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Header = ({ onAddStockClick }) => {
    return (
        <motion.header
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center space-x-4">
                <BarChart className="h-10 w-10 text-black" />
                <h1 className="text-3xl font-bold text-black">
                    TechStock Simulator
                </h1>
            </div>
            <Button
                onClick={onAddStockClick}
                className="bg-black hover:bg-gray-800 text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add New Stock
            </Button>
        </motion.header>
    )
}

export default Header