import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'

const AddStockForm = ({ isOpen, onOpenChange, newStock, handleInputChange, handleAddStock }) => {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="bg-white text-black">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold text-black">Add New Stock</SheetTitle>
                    <SheetDescription className="text-gray-600">
                        Enter the details of the new stock below.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleAddStock} className="space-y-6 mt-6">
                    <div className="space-y-2">
                        <Label htmlFor="symbol" className="text-gray-700">Stock Symbol</Label>
                        <Input
                            id="symbol"
                            name="symbol"
                            value={newStock.symbol}
                            onChange={handleInputChange}
                            className="bg-white border-gray-300 text-black focus:border-black focus:ring-black transition-colors duration-300"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="initialPrice" className="text-gray-700">Initial Price</Label>
                        <Input
                            id="initialPrice"
                            name="initialPrice"
                            type="number"
                            value={newStock.initialPrice}
                            onChange={handleInputChange}
                            className="bg-white border-gray-300 text-black focus:border-black focus:ring-black transition-colors duration-300"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expectedReturn" className="text-gray-700">Expected Return</Label>
                        <Input
                            id="expectedReturn"
                            name="expectedReturn"
                            type="number"
                            value={newStock.expectedReturn}
                            onChange={handleInputChange}
                            className="bg-white border-gray-300 text-black focus:border-black focus:ring-black transition-colors duration-300"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="volatility" className="text-gray-700">Volatility</Label>
                        <Input
                            id="volatility"
                            name="volatility"
                            type="number"
                            value={newStock.volatility}
                            onChange={handleInputChange}
                            className="bg-white border-gray-300 text-black focus:border-black focus:ring-black transition-colors duration-300"
                            required
                        />
                    </div>

                    <div className="flex space-x-4 mt-6">
                        <Button
                            type="submit"
                            className="bg-black hover:bg-gray-800 text-white transition-all duration-300 ease-in-out transform hover:scale-105"
                        >
                            Add Stock
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                            className="bg-gray-200 hover:bg-gray-300 text-black transition-all duration-300 ease-in-out transform hover:scale-105"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}

export default AddStockForm