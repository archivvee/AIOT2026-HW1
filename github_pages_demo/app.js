let sensorChart;
let simulationActive = false;
let simulationTime = 0;
let historyData = [];
const MAX_DATA_POINTS = 30;

// Initialize Chart.js configuration
function initChart() {
    const ctx = document.getElementById('sensorChart').getContext('2d');

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    sensorChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Humidity (%)',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    ticks: { maxRotation: 45, minRotation: 45 }
                },
                y: {
                    type: 'linear', display: true, position: 'left',
                    title: { display: true, text: 'Temperature (°C)' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }
                },
                y1: {
                    type: 'linear', display: true, position: 'right',
                    title: { display: true, text: 'Humidity (%)' },
                    grid: { drawOnChartArea: false, drawBorder: false }
                }
            }
        }
    });
}

// Generate new random data based on sine/cosine periodic math
function generateMockData() {
    if (!simulationActive) return;

    const temp = 25 + 5 * Math.sin(simulationTime * 0.1);
    const hum = 50 + 10 * Math.cos(simulationTime * 0.1);

    const now = new Date();

    historyData.push({
        timestamp: now,
        temperature: temp,
        humidity: hum
    });

    // Keep array size manageable
    if (historyData.length > MAX_DATA_POINTS) {
        historyData.shift();
    }

    simulationTime++;
    updateUI();
}

// Update the chart and HTML text based on local data array
function updateUI() {
    if (historyData.length === 0) return;

    const labels = historyData.map(item => item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const temps = historyData.map(item => item.temperature);
    const hums = historyData.map(item => item.humidity);

    const latest = historyData[historyData.length - 1];

    // Update textual values
    document.getElementById('current-temp').innerText = latest.temperature.toFixed(1);
    document.getElementById('current-hum').innerText = latest.humidity.toFixed(1);

    // Update Chart
    sensorChart.data.labels = labels;
    sensorChart.data.datasets[0].data = temps;
    sensorChart.data.datasets[1].data = hums;
    sensorChart.update();
}

// Toggle Simulation
function toggleSimulation() {
    simulationActive = !simulationActive;

    const btn = document.getElementById('sim-toggle-btn');
    const text = document.getElementById('sim-btn-text');

    if (simulationActive) {
        btn.classList.add('sim-active');
        text.innerText = "Simulation: ON";
    } else {
        btn.classList.remove('sim-active');
        text.innerText = "Simulation: OFF";
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', () => {
    initChart();

    // Automatically start simulation for GitHub pages demo
    toggleSimulation();

    // Generate data every 2 seconds
    setInterval(generateMockData, 2000);
});
