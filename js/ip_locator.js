// Fetch and display user's public IP, private IP, and location
async function fetchLocationData() {
    try {
        // Fetch public IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        document.getElementById('public-ip').textContent = ipData.ip;

        // Fetch location data based on public IP
        const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const locationData = await locationResponse.json();
        document.getElementById('location').textContent = `${locationData.city}, ${locationData.region}, ${locationData.country_name}`;

        // Fetch private IP address (requires WebRTC)
        const privateIP = await getPrivateIP();
        document.getElementById('private-ip').textContent = privateIP;
    } catch (error) {
        console.error('Error fetching location data:', error);
    }
}

// Helper function to get private IP address using WebRTC
function getPrivateIP() {
    return new Promise((resolve, reject) => {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .catch(reject);

        pc.onicecandidate = (event) => {
            if (!event || !event.candidate) return;
            const candidate = event.candidate.candidate;
            const privateIPMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
            if (privateIPMatch) {
                resolve(privateIPMatch[1]);
                pc.close();
            }
        };
    });
}

// Initialize the script
fetchLocationData();