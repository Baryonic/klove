// Fetch and display commodities data
async function fetchCommoditiesData() {
    const apiKey = 'your_api_key_here'; // Replace with your Metals-API key
    const baseUrl = 'https://metals-api.com/api/latest';

    try {
        // Fetch data from Metals-API
        const response = await fetch(`${baseUrl}?access_key=${apiKey}&base=USD&symbols=EUR,XAU,XAG`);
        const data = await response.json();

        if (data.success) {
            // Populate the data into the HTML
            document.getElementById('usd-eur').textContent = data.rates.EUR.toFixed(2);
            document.getElementById('gold-price').textContent = data.rates.XAU.toFixed(2);
            document.getElementById('silver-price').textContent = data.rates.XAG.toFixed(2);

            // Petrodollar price is not directly available; placeholder for future implementation
            document.getElementById('petrodollar-price').textContent = 'N/A';
        } else {
            console.error('Error fetching data:', data.error);
        }
    } catch (error) {
        console.error('Error fetching commodities data:', error);
    }
}

// Initialize the script
fetchCommoditiesData();