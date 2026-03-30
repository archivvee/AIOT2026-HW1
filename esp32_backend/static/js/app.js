let sensorChart;

// Initialize Chart.js configuration
function initChart() {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    
    // Set chart default text color for dark mode
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
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
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
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                        drawBorder: false
                    }
                }
            }
        }
    });
}

// Fetch data and update UI
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        if (data && data.length > 0) {
            // Update labels and dataset
            // The latest data is at the end of the array due to backend logic
            const labels = data.map(item => {
                // Formatting timestamp
                const d = new Date(item.timestamp);
                return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            });
            
            const temps = data.map(item => item.temperature);
            const hums = data.map(item => item.humidity);
            
            // Update current values display
            const latest = data[data.length - 1];
            
            // Simple animation for numbers (just direct assignment for now, CSS handles hover)
            const tempEl = document.getElementById('current-temp');
            const humEl = document.getElementById('current-hum');
            
            if (tempEl.innerText !== latest.temperature.toFixed(1)) {
                tempEl.innerText = latest.temperature.toFixed(1);
            }
            if (humEl.innerText !== latest.humidity.toFixed(1)) {
                humEl.innerText = latest.humidity.toFixed(1);
            }
            
            // Update chart smoothly
            sensorChart.data.labels = labels;
            sensorChart.data.datasets[0].data = temps;
            sensorChart.data.datasets[1].data = hums;
            sensorChart.update('none'); // Update without full animation for smoother active polling
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch Simulation Status
async function checkSimulationStatus() {
    try {
        const response = await fetch('/api/simulation/status');
        const data = await response.json();
        updateSimulationUI(data.active);
    } catch (error) {
        console.error('Error fetching sim status:', error);
    }
}

// Toggle Simulation
async function toggleSimulation() {
    try {
        const response = await fetch('/api/simulation/toggle', {
            method: 'POST'
        });
        const data = await response.json();
        updateSimulationUI(data.active);
    } catch (error) {
        console.error('Error toggling sim:', error);
    }
}

// Helper to update button appearance
function updateSimulationUI(isActive) {
    const btn = document.getElementById('sim-toggle-btn');
    const text = document.getElementById('sim-btn-text');
    
    if (isActive) {
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
    
    // Initial fetches
    fetchData();
    checkSimulationStatus();
    
    // Poll data every 2 seconds
    setInterval(fetchData, 2000);
});
