document.addEventListener("DOMContentLoaded", function() {
    const infoContainer = document.querySelector('.info_div_class');
    
    // Function to fetch and display random info
    async function loadRandomInfo() {
        try {
            const response = await fetch('data/info.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const infoData = await response.json();
            
            if (!infoData || infoData.length === 0) {
                throw new Error('No info data available');
            }
            
            // Select a random item from the array
            const randomIndex = Math.floor(Math.random() * infoData.length);
            const randomInfo = infoData[randomIndex];
            
            // Display the random info
            displayInfo(randomInfo);
            
        } catch (error) {
            console.error('Error loading info:', error);
            displayError();
        }
    }
    
    // Function to display info in the container
    function displayInfo(info) {
        if (!infoContainer) return;
        
        infoContainer.innerHTML = `
            <div class="info-container">
                <h2>Did You Know?</h2>
                <div class="info-content">
                    <h3 class="info-title">${info.title}</h3>
                    <p class="info-description">${info.description}</p>
                </div>
                <button class="refresh-info-btn" title="Get another tip">🔄 New Tip</button>
            </div>
        `;
        
        // Add event listener to the refresh button
        const refreshBtn = infoContainer.querySelector('.refresh-info-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadRandomInfo);
        }
    }
    
    // Function to display error message
    function displayError() {
        if (!infoContainer) return;
        
        infoContainer.innerHTML = `
            <div class="info-container">
                <h2>Information</h2>
                <div class="info-content">
                    <p class="info-error">Unable to load information at this time.</p>
                </div>
                <button class="refresh-info-btn" title="Try again">🔄 Retry</button>
            </div>
        `;
        
        // Add event listener to the retry button
        const retryBtn = infoContainer.querySelector('.refresh-info-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', loadRandomInfo);
        }
    }
    
    // Load initial random info
    loadRandomInfo();
});