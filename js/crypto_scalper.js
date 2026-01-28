document.addEventListener('DOMContentLoaded', function() {
    const coins = ['BTC','ETH','SOL','SHIB','DOGE','DOT'];
    const container = document.querySelector('.crypto-scalper-div .scalper-prices');

    if (!container) return;

    // Create boxes
    function createBoxes() {
        container.innerHTML = '';
        coins.forEach(sym => {
            const box = document.createElement('div');
            box.className = 'scalper-box';
            box.innerHTML = `
                <div class="scalper-symbol">${sym}</div>
                <div class="scalper-info">EUR: <span id="scalper-${sym}-eur" >Loading...</span></div>
                <div class="scalper-info">USDC: <span id="scalper-${sym}-usdc" >Loading...</span></div>
            `;
            container.appendChild(box);
        });
    }

    async function fetchRates(sym) {
        try {
            const resp = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${sym}`);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const j = await resp.json();
            const rates = j && j.data && j.data.rates ? j.data.rates : null;

            const eurRaw = rates && rates.EUR ? rates.EUR : null;
            const usdcRaw = rates && (rates.USDC || rates['USDC']) ? (rates.USDC || rates['USDC']) : null;

            const eurEl = document.getElementById(`scalper-${sym}-eur`);
            const usdcEl = document.getElementById(`scalper-${sym}-usdc`);

            if (eurEl) eurEl.textContent = eurRaw ? Number(eurRaw).toFixed(6) : 'N/A';
            if (usdcEl) usdcEl.textContent = usdcRaw ? Number(usdcRaw).toFixed(6) : 'N/A';
        } catch (err) {
            console.warn('Error fetching rates for', sym, err);
            const eurEl = document.getElementById(`scalper-${sym}-eur`);
            const usdcEl = document.getElementById(`scalper-${sym}-usdc`);
            if (eurEl) eurEl.textContent = 'N/A';
            if (usdcEl) usdcEl.textContent = 'N/A';
        }
    }

    async function updateAll() {
        await Promise.all(coins.map(c => fetchRates(c)));
        const tsEl = document.querySelector('.crypto-scalper-div .last-updated');
        if (tsEl) tsEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }

    createBoxes();
    updateAll();
    setInterval(updateAll, 5000);
});
