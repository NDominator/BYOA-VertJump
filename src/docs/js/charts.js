class JumpCharts {
    constructor(dataProcessor) {
        this.dataProcessor = dataProcessor;
        this.trendChart = null;
        this.initializeTrendChart();
    }

    initializeTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');
        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Vertical Jump Progress Over Time'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Jump Height (inches)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    updateDashboard(data) {
        this.updateTopJumpers(data);
        this.updateMostImproved(data);
        this.updateChampion(data);
        this.updateTrendChart(data);
    }

    updateTopJumpers(data) {
        const topJumpersDiv = document.getElementById('topJumpers');
        const topJumpers = this.dataProcessor.getTopJumpers();
        
        topJumpersDiv.innerHTML = topJumpers.map((jumper, index) => `
            <div class="ranking-item">
                <span class="rank">#${index + 1}</span>
                <span class="name">${jumper.name}</span>
                <span class="score">${jumper.pr.toFixed(1)}"</span>
            </div>
        `).join('');
    }

    updateMostImproved(data) {
        const improvedDiv = document.getElementById('mostImproved');
        const mostImproved = this.dataProcessor.getMostImproved();
        
        if (mostImproved) {
            improvedDiv.innerHTML = mostImproved.map((jumper, index) => `
                <div class="ranking-item">
                    <span class="rank">#${index + 1}</span>
                    <span class="name">${jumper.name}</span>
                    <span class="improvement">+${jumper.improvement.toFixed(1)}"</span>
                </div>
            `).join('');
        }
    }

    updateChampion(data) {
        const championDiv = document.getElementById('champion');
        const champion = this.dataProcessor.getOverallChampion();
        
        if (champion) {
            championDiv.innerHTML = `
                <div class="champion-card">
                    <div class="champion-header">
                        <span class="medal">🏅</span>
                        <div class="champion-name">${champion.name}</div>
                    </div>
                    <div class="champion-score">${champion.pr.toFixed(1)}"</div>
                    <div class="champion-date">Set on ${champion.date.toLocaleDateString()}</div>
                </div>
            `;
        }
    }

    updateTrendChart(data) {
        // Group data by date and calculate averages
        const dateGroups = new Map();
        data.forEach(entry => {
            const dateKey = entry.date.toISOString().split('T')[0];
            if (!dateGroups.has(dateKey)) {
                dateGroups.set(dateKey, []);
            }
            dateGroups.get(dateKey).push(entry.pr);
        });

        const labels = Array.from(dateGroups.keys()).sort();
        const averages = labels.map(date => {
            const values = dateGroups.get(date);
            return values.reduce((a, b) => a + b, 0) / values.length;
        });

        this.trendChart.data.labels = labels;
        this.trendChart.data.datasets = [{
            label: 'Class Average PR',
            data: averages,
            borderColor: '#0033A0',
            backgroundColor: '#FFD100',
            tension: 0.1
        }];
        this.trendChart.update();
    }
}

// Initialize charts when dataProcessor is ready
const jumpCharts = new JumpCharts(dataProcessor);

// Update dataProcessor to use charts
dataProcessor.updateDashboard = function() {
    jumpCharts.updateDashboard(this.data);
}; 