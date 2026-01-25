// Fetch and display commodities data: try Frankfurter, then FloatRates fallback
async function fetchCommoditiesData() {
    const frankfurterUrl = 'https://api.frankfurter.app/latest?from=USD&to=EUR';
    const floatRatesUrl = 'http://www.floatrates.com/daily/usd.json';

    try {
        console.log('Starting API call to Frankfurter API...');
        let response = await fetch(frankfurterUrl);
        console.log('Frankfurter response status:', response.status);

        let data = await response.json().catch(() => null);
        console.log('Frankfurter response JSON:', data);

        // If Frankfurter returned a usable structure, use it
        if (response.ok && data && data.rates && typeof data.rates.EUR === 'number') {
            const eur = data.rates.EUR;
            document.getElementById('usd-eur').textContent = eur.toFixed(4);
            console.log('Used Frankfurter EUR:', eur);

            // placeholders for other commodities
            document.getElementById('gold-price').textContent = 'N/A';
            document.getElementById('silver-price').textContent = 'N/A';
            document.getElementById('petrodollar-price').textContent = 'N/A';
        
            // Fetch gold/silver prices in EUR from goldprice.org
            try {
                const goldResp = await fetch('https://data-asg.goldprice.org/dbXRates/EUR');
                const goldData = await goldResp.json();
                console.log('GoldPrice EUR response:', goldData);

                // Find the array that contains xau/xag
                const arrKey = Object.keys(goldData).find(k => Array.isArray(goldData[k]) && goldData[k].length && (goldData[k][0].xauPrice || goldData[k][0].xagPrice));
                const goldObj = arrKey ? goldData[arrKey][0] : null;

                if (goldObj) {
                    if (typeof goldObj.xauPrice === 'number') {
                        document.getElementById('gold-price').textContent = goldObj.xauPrice.toFixed(2);
                    }
                    if (typeof goldObj.xagPrice === 'number') {
                        document.getElementById('silver-price').textContent = goldObj.xagPrice.toFixed(2);
                    }
                } else {
                    console.warn('GoldPrice response missing expected fields.');
                }
            } catch (gerr) {
                console.error('Error fetching gold/silver data:', gerr);
            }
            // Update timestamp
            try {
                const tsEl = document.querySelector('.commodities_div .last-updated');
                if (tsEl) tsEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
            } catch (te) {
                console.warn('Could not update commodities timestamp:', te);
            }
            return;
        }

        // Fallback to FloatRates
        console.warn('Frankfurter failed or returned unexpected data; falling back to FloatRates.');
        console.log('Fetching FloatRates at', floatRatesUrl);
        response = await fetch(floatRatesUrl);
        console.log('FloatRates response status:', response.status);
        data = await response.json();
        console.log('FloatRates response JSON (truncated):', data && data.eur ? { eur: data.eur } : data);

        if (data && data.eur && typeof data.eur.rate === 'number') {
            const eur = data.eur.rate;
            document.getElementById('usd-eur').textContent = eur.toFixed(4);
            console.log('Used FloatRates EUR:', eur);

            document.getElementById('gold-price').textContent = 'N/A';
            document.getElementById('silver-price').textContent = 'N/A';
            document.getElementById('petrodollar-price').textContent = 'N/A';
            // Update timestamp
            try {
                const tsEl = document.querySelector('.commodities_div .last-updated');
                if (tsEl) tsEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
            } catch (te) {
                console.warn('Could not update commodities timestamp:', te);
            }
            return;
        }

        console.error('Error: No valid exchange data from either provider.');
        alert('Failed to fetch exchange rates from providers.');
    } catch (error) {
        console.error('Error fetching commodities data:', error);
        alert('An error occurred while fetching commodities data. Please check your network connection or serve the site via http/https (Live Server).');
    }
}

// Initialize the script
fetchCommoditiesData();