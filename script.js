const API_KEY = '4XZODU6CQ7F9WCTL';
const NEWS_API_KEY = '1885496b39bf40dd930921541aba553f';

function fetchStockData() {
  const symbol = document.getElementById('stockSymbol').value.trim();
  if (!symbol) return;

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
        document.getElementById('stockResult').innerHTML = `<p>Invalid symbol or API limit reached.</p>`;
        return;
      }

      const dates = Object.keys(timeSeries).slice(0, 7);
      const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));
      const latest = dates[0];
      const info = timeSeries[latest];

      const open = info['1. open'];
      const high = info['2. high'];
      const low = info['3. low'];
      const close = info['4. close'];
      const volume = info['5. volume'];

      // ⬆️⬇️ Trend calculation
      const avgClose = prices.reduce((a, b) => a + b, 0) / prices.length;
      const trend = parseFloat(close) > avgClose ? 'Uptrend 📈' : 'Downtrend 📉';

      const suggestion = getTrendSuggestion(prices);

      document.getElementById('stockResult').innerHTML = `
        <h3>${symbol.toUpperCase()} - ${latest}</h3>
        <ul>
          <li><strong>Open:</strong> $${parseFloat(open).toFixed(2)}</li>
          <li><strong>High:</strong> $${parseFloat(high).toFixed(2)}</li>
          <li><strong>Low:</strong> $${parseFloat(low).toFixed(2)}</li>
          <li><strong>Close:</strong> $${parseFloat(close).toFixed(2)}</li>
          <li><strong>Volume:</strong> ${volume}</li>
          <li><strong>Market Trend:</strong> ${trend}</li>
          <li><strong>Exchange:</strong> <span id="exchangeInfo">Loading...</span></li>
        </ul>
        <div class="suggestion-box">
          <p><strong>Recommendation:</strong> ${suggestion.emoji} 
          <span style="color: ${suggestion.color}">${suggestion.text}</span></p>
        </div>
      `;

      // 🔔 Alert if threshold met
      const alertPrice = parseFloat(document.getElementById('alertPrice').value);
      if (!isNaN(alertPrice) && parseFloat(close) >= alertPrice) {
        alert(`🔔 ALERT: ${symbol.toUpperCase()} has reached $${close}`);
      }

      // 📈 Chart
      renderStockChart(dates.reverse(), prices.reverse(), symbol.toUpperCase());

      // 🏦 Fetch Exchange Info
      fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
          if (data.Exchange) {
            document.getElementById("exchangeInfo").textContent = data.Exchange;
          } else {
            document.getElementById("exchangeInfo").textContent = "Unknown";
          }
        })
        .catch(() => {
          document.getElementById("exchangeInfo").textContent = "Unavailable";
        });
    })
    .catch(() => {
      document.getElementById('stockResult').innerHTML = `<p>Error fetching data.</p>`;
    });
}

function getTrendSuggestion(prices) {
  const recent = prices[0];
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

  if (recent > avg * 1.02) {
    return { text: 'BUY', emoji: '🟢', color: 'green' };
  } else if (recent < avg * 0.98) {
    return { text: 'SELL', emoji: '🔻', color: 'red' };
  } else {
    return { text: 'HOLD', emoji: '⏸️', color: 'orange' };
  }
}

function renderStockChart(dates, prices, label) {
  const ctx = document.getElementById('stockChart').getContext('2d');
  if (window.stockChartInstance) window.stockChartInstance.destroy();

  window.stockChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: `${label} Closing Prices`,
        data: prices,
        borderColor: '#1e88e5',
        fill: false,
        tension: 0.3,
      }]
    }
  });
}

function convertCurrency() {
  const amount = parseFloat(document.getElementById('amount').value);
  const from = document.getElementById('fromCurrency').value;
  const to = document.getElementById('toCurrency').value;

  if (!amount) return;

  const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${API_KEY}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const rate = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
      const converted = (amount * rate).toFixed(2);
      document.getElementById('convertedResult').textContent = `${amount} ${from} = ${converted} ${to}`;
    })
    .catch(() => {
      document.getElementById('convertedResult').textContent = "Conversion failed.";
    });
}

function fetchIndices() {
  const indices = [
    { symbol: '^NSEI', name: 'niftyValue' },
    { symbol: 'BSE:SENSEX', name: 'sensexValue' }
  ];

  indices.forEach(({ symbol, name }) => {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const series = data['Time Series (Daily)'];
        const latest = Object.keys(series)[0];
        const close = series[latest]['4. close'];
        document.getElementById(name).textContent = `$${parseFloat(close).toFixed(2)}`;
      })
      .catch(() => {
        document.getElementById(name).textContent = "Unavailable";
      });
  });
}

function fetchNewsHeadlines() {
  const url = `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=5&apiKey=${NEWS_API_KEY}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById("newsFeed");
      list.innerHTML = "";

      if (!data.articles || data.articles.length === 0) {
        list.innerHTML = "<li>No news available.</li>";
        return;
      }

      data.articles.forEach(article => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = article.url;
        a.textContent = article.title;
        a.target = "_blank";
        li.appendChild(a);
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Error fetching news:", err);
      document.getElementById("newsFeed").innerHTML = "<li>Failed to load news.</li>";
    });
}

window.onload = () => {
  fetchIndices();
  fetchNewsHeadlines();
};
