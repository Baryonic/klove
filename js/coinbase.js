document.addEventListener("DOMContentLoaded", function() {
    // Coinbase API endpoints for spot prices and volume data
    const cryptoPairs = [
        { symbol: 'USDC-EUR', name: 'USDC/EUR' },
        { symbol: 'BTC-USD', name: 'BTC/USD' },
        { symbol: 'ETH-USD', name: 'ETH/USD' },
        { symbol: 'SOL-USD', name: 'SOL/USD' },
        { symbol: 'DOT-USD', name: 'DOT/USD' },
        { symbol: 'DOGE-USD', name: 'DOGE/USD' },
        { symbol: 'SHIB-USD', name: 'SHIB/USD' },
        { symbol: 'BONK-USD', name: 'BONK/USD' }
    ];

    const priceContainer = document.querySelector('.coinbase_div_class .crypto-prices');
    
    let updateInterval;

    // Function to fetch price and volume for a single cryptocurrency
    async function fetchCryptoData(symbol) {
        try {
            // Fetch price data
            const priceResponse = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${symbol.split('-')[0]}`);
            
            if (!priceResponse.ok) {
                throw new Error(`HTTP error! status: ${priceResponse.status}`);
            }
            
            const priceData = await priceResponse.json();
            const targetCurrency = symbol.split('-')[1];
            const price = priceData.data.rates[targetCurrency];

            // Fetch 24h stats (volume data) - using Coinbase Pro API
            let volume = 'N/A';
            try {
                const statsResponse = await fetch(`https://api.exchange.coinbase.com/products/${symbol}/stats`);
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    volume = statsData.volume ? formatVolume(parseFloat(statsData.volume)) : 'N/A';
                }
            } catch (volumeError) {
                console.warn(`Could not fetch volume for ${symbol}:`, volumeError);
                volume = 'N/A';
            }
            
            return {
                symbol: symbol,
                price: price ? parseFloat(price).toFixed(getDecimalPlaces(symbol, price)) : 'N/A',
                currency: targetCurrency,
                volume24h: volume
            };
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            return {
                symbol: symbol,
                price: 'Error',
                currency: symbol.split('-')[1],
                volume24h: 'Error'
            };
        }
    }

    // Function to determine decimal places based on price value
    function getDecimalPlaces(symbol, price) {
        const targetCurrency = symbol.split('-')[1];
        if (targetCurrency === 'EUR') return 4;
        
        const numPrice = parseFloat(price);
        if (numPrice >= 1000) return 0;
        if (numPrice >= 100) return 2;
        if (numPrice >= 1) return 2;
        if (numPrice >= 0.01) return 4;
        if (numPrice >= 0.0001) return 6;
        return 8;
    }

    // Function to format volume numbers
    function formatVolume(volume) {
        if (volume >= 1000000000) {
            return (volume / 1000000000).toFixed(2) + 'B';
        } else if (volume >= 1000000) {
            return (volume / 1000000).toFixed(2) + 'M';
        } else if (volume >= 1000) {
            return (volume / 1000).toFixed(2) + 'K';
        } else {
            return volume.toFixed(2);
        }
    }

    // Function to update all cryptocurrency prices and volumes
    async function updateAllPrices() {
        try {
            // Fetch all data concurrently
            const dataPromises = cryptoPairs.map(pair => fetchCryptoData(pair.symbol));
            const cryptoData = await Promise.all(dataPromises);

            // Update the display
            displayCryptoData(cryptoData);

        } catch (error) {
            console.error('Error updating crypto data:', error);
            // Show error in the container instead of loading indicator
            if (priceContainer) {
                priceContainer.innerHTML = '<div class="error-message">Failed to load crypto data</div>';
            }
        }
    }

    // Function to display crypto data in the container
    function displayCryptoData(cryptoDataArray) {
        if (!priceContainer) return;

        priceContainer.innerHTML = '';

        cryptoDataArray.forEach((cryptoData, index) => {
            const pairInfo = cryptoPairs[index];
            
            const priceItem = document.createElement('div');
            priceItem.className = 'price-item';
            
            // Determine price color based on whether it's an error or valid price
            const priceClass = cryptoData.price === 'Error' || cryptoData.price === 'N/A' ? 'price-error' : 'price-value';
            const volumeClass = cryptoData.volume24h === 'Error' || cryptoData.volume24h === 'N/A' ? 'volume-error' : 'volume-value';
            
            priceItem.innerHTML = `
                <div class="crypto-info">
                    <div class="crypto-symbol">${pairInfo.name}</div>
                    <div class="crypto-volume ${volumeClass}">Vol: ${cryptoData.volume24h}</div>
                </div>
                <div class="crypto-price ${priceClass}">
                    ${cryptoData.price !== 'Error' && cryptoData.price !== 'N/A' ? 
                        `${cryptoData.price} ${cryptoData.currency}` : 
                        cryptoData.price
                    }
                </div>
            `;
            
            priceContainer.appendChild(priceItem);
        });

        // Update timestamp
        const timestampElement = document.querySelector('.coinbase_div_class .last-updated');
        if (timestampElement) {
            const now = new Date();
            timestampElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
        }
    }

    // Function to start automatic updates
    function startPriceUpdates() {
        // Initial load
        updateAllPrices();
        
        // Update every 2 seconds
        updateInterval = setInterval(updateAllPrices, 2000);
    }

    // Function to stop automatic updates
    function stopPriceUpdates() {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
    }

    // Start the price updates
    startPriceUpdates();

    // Stop updates when the page is hidden (to save API calls)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopPriceUpdates();
        } else {
            startPriceUpdates();
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        stopPriceUpdates();
    });
});