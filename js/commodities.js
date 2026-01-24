// Fetch and display commodities data
async function fetchCommoditiesData() {
    const apiKey = 'your_api_key_here'; // Replace with your Metals-API key
    const baseUrl = 'https://metals-api.com/api/latest';
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Proxy to bypass CORS issues

    try {
        // Fetch data from Metals-API using a proxy
        const response = await fetch(`${proxyUrl}${baseUrl}?access_key=${apiKey}&base=USD&symbols=EUR,XAU,XAG`);
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
            alert('Failed to fetch commodities data. Please try again later.');
        }
    } catch (error) {
        console.error('Error fetching commodities data:', error);
        alert('An error occurred while fetching commodities data. Please check your network connection.');
    }
}

// Initialize the script
fetchCommoditiesData();