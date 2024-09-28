console.log('Worker script started');

let simulationInterval;
let progress = 0;
let stockSymbol = 'AAPL';
let stockParams = {};
let stopSimulationFlag = false;

self.addEventListener('message', (event) => {
    const { data } = event;
    console.log('Worker received message:', data);

    if (data.type === 'START_SIMULATION') {
        const { stockSymbol: symbol, initialPrice, expectedReturn, volatility } = data.payload;
        stockSymbol = symbol || 'AAPL';

        // Parse the parameters safely with default fallbacks
        const initialPriceParsed = parseFloat(initialPrice);
        const expectedReturnParsed = parseFloat(expectedReturn);
        const volatilityParsed = parseFloat(volatility);

        stockParams = {
            initialPrice: !isNaN(initialPriceParsed) ? initialPriceParsed : getInitialPrice(stockSymbol),
            expectedReturn: !isNaN(expectedReturnParsed) ? expectedReturnParsed : 0,
            volatility: !isNaN(volatilityParsed) ? volatilityParsed : getStockVolatility(stockSymbol),
        };

        console.log('Parsed stock parameters:', stockParams);
        stopSimulationFlag = false;
        startSimulation();
    } else if (data.type === 'STOP_SIMULATION') {
        console.log('Received STOP_SIMULATION message');
        stopSimulation();
    }
});

function startSimulation() {
    let price = stockParams.initialPrice;
    progress = 0;

    // Convert percentages to decimals
    const expectedReturn = stockParams.expectedReturn / 100;
    const volatility = stockParams.volatility / 100;
    const startTime = Date.now();

    // Initialize high and low prices
    let highPrice = price;
    let lowPrice = price;

    const simulationIntervalMs = 1000; // 1-second interval
    const totalSteps = 100; // Simulate 100 trading days

    simulationInterval = setInterval(() => {
        if (stopSimulationFlag) {
            stopSimulation(); // Exit if simulation was flagged for stopping
            return;
        }

        progress += 1;

        // Time increment in years (one trading day)
        const dt = 1 / 252; // One trading day out of 252 trading days in a year

        // Generate a random normal variable using Box-Muller transform
        const u1 = Math.random();
        const u2 = Math.random();
        const Z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        // Simulate stock price change using Geometric Brownian Motion
        const dPrice = price * (expectedReturn * dt + volatility * Math.sqrt(dt) * Z);
        price += dPrice;

        // Ensure price doesn't go negative
        if (price < 1) price = 1;

        // Update high and low prices
        if (price > highPrice) highPrice = price;
        if (price < lowPrice) lowPrice = price;

        const stockUpdate = {
            time: new Date().toISOString(),
            price: parseFloat(price.toFixed(2)),
        };

        // Log progress every 10 steps to reduce log spam
        if (progress % 10 === 0) {
            console.log(
                `Step: ${progress}, Price: $${price.toFixed(2)}, Change: $${dPrice.toFixed(2)}, High: $${highPrice.toFixed(
                    2,
                )}, Low: $${lowPrice.toFixed(2)}`
            );
        }

        // Send stock update to the main app
        self.postMessage({
            type: 'STOCK_UPDATE',
            payload: { stockSymbol, time: stockUpdate.time, price: stockUpdate.price },
        });

        // Send high and low prices to the main app
        self.postMessage({
            type: 'HIGH_LOW_UPDATE',
            payload: {
                stockSymbol,
                highPrice: parseFloat(highPrice.toFixed(2)),
                lowPrice: parseFloat(lowPrice.toFixed(2)),
                currentPrice: stockUpdate.price,
            },
        });

        // Send progress update
        const elapsedTime = Date.now() - startTime;
        const estimatedTotalTime = (totalSteps / progress) * elapsedTime;
        const estimatedTimeRemaining = estimatedTotalTime - elapsedTime;

        self.postMessage({
            type: 'PROGRESS_UPDATE',
            payload: {
                progress: ((progress / totalSteps) * 100).toFixed(2),
                estimatedTimeRemaining: formatTime(estimatedTimeRemaining),
            },
        });

        // Stop simulation after totalSteps
        if (progress >= totalSteps) {
            stopSimulation();
        }
    }, simulationIntervalMs);

    // Update status
    self.postMessage({ type: 'STATUS', payload: `Simulating ${stockSymbol}...` });
}

function stopSimulation() {
    clearInterval(simulationInterval);
    stopSimulationFlag = true;
    console.log('Stopping simulation for', stockSymbol);
    self.postMessage({ type: 'STATUS', payload: `Simulation of ${stockSymbol} stopped.` });
    // Notify the main app that the simulation has ended
    self.postMessage({ type: 'SIMULATION_ENDED', payload: { stockSymbol } });
    self.close(); // Close the worker
}

// Helper functions to get initial price and volatility
function getInitialPrice(symbol) {
    const initialPrices = {
        AAPL: 150,
        GOOGL: 2800,
        MSFT: 300,
        AMZN: 3500,
        TSLA: 700,
    };
    return initialPrices[symbol] || 100;
}

function getStockVolatility(symbol) {
    const volatilities = {
        AAPL: 2,
        GOOGL: 15,
        MSFT: 3,
        AMZN: 20,
        TSLA: 10,
    };
    return volatilities[symbol] || 5;
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
}
