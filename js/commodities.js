// Fetch and display commodities data
async function fetchCommoditiesData() {
    const apiKey = 'your_api_key_here'; // Replace with your Metals-API key
    const baseUrl = 'https://metals-api.com/api/latest';

    try {
        console.log('Starting API call to Metals-API...');
        document.body.innerHTML += '<p>Debug: Starting API call...</p>';

        // Fetch data from Metals-API directly
        const response = await fetch(`${baseUrl}?access_key=${apiKey}&base=USD&symbols=EUR,XAU,XAG`);
        console.log('API call completed. Checking response...');
        document.body.innerHTML += '<p>Debug: API call completed...</p>';

        const data = await response.json();
        console.log('Response JSON:', data);
        document.body.innerHTML += `<p>Debug: Response JSON: ${JSON.stringify(data)}</p>`;

        if (data.success) {
            console.log('Data fetched successfully:', data);
            document.body.innerHTML += '<p>Debug: Data fetched successfully...</p>';

            // Populate the data into the HTML
            document.getElementById('usd-eur').textContent = data.rates.EUR.toFixed(2);
            document.getElementById('gold-price').textContent = data.rates.XAU.toFixed(2);
            document.getElementById('silver-price').textContent = data.rates.XAG.toFixed(2);

            // Petrodollar price is not directly available; placeholder for future implementation
            document.getElementById('petrodollar-price').textContent = 'N/A';
        } else {
            console.error('Error fetching data:', data.error);
            document.body.innerHTML += `<p>Debug: Error fetching data: ${data.error}</p>`;
            alert('Failed to fetch commodities data. Please try again later.');
        }
    } catch (error) {
        console.error('Error fetching commodities data:', error);
        document.body.innerHTML += `<p>Debug: Error occurred: ${error.message}</p>`;
        alert('An error occurred while fetching commodities data. Please check your network connection.');
    }
}

// Initialize the script
fetchCommoditiesData();