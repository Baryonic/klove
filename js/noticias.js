document.addEventListener("DOMContentLoaded", function() {
    // The Google News RSS feed URL
    const rssUrl = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en";
    
    // Use the rss2json API to convert the RSS feed to JSON and handle CORS
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    const feedContainer = document.querySelector('.noticias_div_class .news-feed');
    const loadingIndicator = document.querySelector('.noticias_div_class .loading');
    
    let newsItems = [];
    let currentIndex = 0;
    let autoScrollInterval;
    let isManualScrolling = false;

    // Function to display a single news item
    function displayNewsItem(index) {
        if (newsItems.length === 0) return;
        
        const item = newsItems[index];
        const newsItemDiv = feedContainer.querySelector('.news-item');
        
        if (newsItemDiv) {
            const titleElement = newsItemDiv.querySelector('h3 a');
            const descriptionElement = newsItemDiv.querySelector('p');
            
            titleElement.href = item.link;
            titleElement.textContent = item.title;
            titleElement.target = "_blank";
            
            // Display the HTML description with source links (like in the original)
            // The description often contains HTML with links to sources
            descriptionElement.innerHTML = item.description;
        }
    }

    // Function to go to next news item
    function nextNews() {
        if (newsItems.length === 0) return;
        currentIndex = (currentIndex + 1) % newsItems.length;
        displayNewsItem(currentIndex);
    }

    // Function to go to previous news item
    function prevNews() {
        if (newsItems.length === 0) return;
        currentIndex = (currentIndex - 1 + newsItems.length) % newsItems.length;
        displayNewsItem(currentIndex);
    }

    // Function to start auto-scroll
    function startAutoScroll() {
        stopAutoScroll();
        autoScrollInterval = setInterval(nextNews, 10000); // 10 seconds
    }

    // Function to stop auto-scroll
    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }

    // Function to handle manual scrolling
    function handleManualScroll(direction) {
        isManualScrolling = true;
        stopAutoScroll();
        
        if (direction === 'next') {
            nextNews();
        } else {
            prevNews();
        }
        
        // Resume auto-scroll after 3 seconds of inactivity
        setTimeout(() => {
            if (isManualScrolling) {
                isManualScrolling = false;
                startAutoScroll();
            }
        }, 3000);
    }

    // Fetch news from API
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Check if the API call was successful
            if (data.status !== "ok") {
                throw new Error("Failed to fetch RSS feed from the API.");
            }

            loadingIndicator.style.display = "none";
            newsItems = data.items || [];

            if (newsItems.length === 0) {
                feedContainer.innerHTML = "<p>No news items found.</p>";
                return;
            }

            // Display the first news item
            displayNewsItem(0);
            
            // Start auto-scroll
            startAutoScroll();

            // Add event listeners for manual navigation
            const nextBtn = document.querySelector('.noticias_div_class .next-btn');
            const prevBtn = document.querySelector('.noticias_div_class .prev-btn');
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => handleManualScroll('next'));
            }
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => handleManualScroll('prev'));
            }

            // Add keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') {
                    handleManualScroll('next');
                } else if (e.key === 'ArrowLeft') {
                    handleManualScroll('prev');
                }
            });

        })
        .catch(error => {
            // Display an error message if the fetch fails
            loadingIndicator.textContent = "Failed to load news feed. Please try again later.";
            console.error("There was a problem with the fetch operation:", error);
        });
});