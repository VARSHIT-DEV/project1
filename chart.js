let chartInstance;

function renderStockChart(dates, prices, label = 'Stock Prices') {
  const ctx = document.getElementById('stockChart').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates.reverse(),
      datasets: [
        {
          label: label,
          data: prices.reverse(),
          borderColor: '#1e88e5',
          backgroundColor: 'rgba(30, 136, 229, 0.2)',
          tension: 0.4,
          pointRadius: 4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: {
          title: { display: true, text: 'Date' }
        },
        y: {
          title: { display: true, text: 'Price (USD)' }
        }
      }
    }
  });
}
