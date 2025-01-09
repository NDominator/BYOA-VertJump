class JumpDataProcessor {
    constructor() {
        this.data = [];
        this.setupEventListeners();
        this.loadSampleData();
    }

    setupEventListeners() {
        document.getElementById('csvFile').addEventListener('change', this.handleFileSelect.bind(this));
        document.getElementById('importBtn').addEventListener('click', () => {
            const fileInput = document.getElementById('csvFile');
            if (fileInput.files.length > 0) {
                this.handleFileSelect({ target: fileInput });
            } else {
                alert('Please select a file first');
            }
        });
        document.getElementById('searchInput').addEventListener('input', this.filterTable.bind(this));
        document.getElementById('exportBtn').addEventListener('click', this.exportReport.bind(this));
        // Remove grade selector for now since we don't have grade data
        // document.getElementById('gradeSelect').addEventListener('change', this.updateDashboard.bind(this));
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            console.log('Processing file:', file.name);
            const text = await file.text();
            console.log('File content length:', text.length);
            this.parseCSV(text);
        }
    }

    parseCSV(csvText) {
        console.log('Parsing CSV...');
        const lines = csvText.split('\n');
        console.log('Number of lines:', lines.length);
        const headers = lines[0].split(',');
        console.log('Headers:', headers);
        
        try {
            this.data = lines.slice(1)
                .filter(line => line.trim()) // Skip empty lines
                .map(line => {
                    const values = line.split(',');
                    console.log('Processing line:', values[0]); // Log the name being processed
                    return {
                        name: values[0],
                        average: parseFloat(values[1]),
                        pr: parseFloat(values[2]),
                        pr90: parseFloat(values[3]),
                        date: new Date(values[4]),
                        set1Jumps: [
                            parseFloat(values[5]),
                            parseFloat(values[6]),
                            parseFloat(values[7])
                        ],
                        set2Jumps: [
                            parseFloat(values[8]),
                            parseFloat(values[9]),
                            parseFloat(values[10])
                        ]
                    };
                });

            console.log('Processed data:', this.data);
            // Force table update immediately
            this.updateTable();
            // Then update the rest of the dashboard
            jumpCharts.updateDashboard(this.data);

        } catch (error) {
            console.error('Error parsing CSV:', error);
            alert('Error parsing the CSV file. Please check the console for details.');
        }
    }

    getTopJumpers() {
        return this.data
            .sort((a, b) => b.pr - a.pr)
            .slice(0, 3);
    }

    getMostImproved() {
        // Since we only have one date point per student currently,
        // we'll calculate improvement as difference between PR and average
        return this.data
            .map(jumper => ({
                name: jumper.name,
                improvement: jumper.pr - jumper.average,
                initialValue: jumper.average,
                finalValue: jumper.pr
            }))
            .sort((a, b) => b.improvement - a.improvement)
            .slice(0, 3);
    }

    getOverallChampion() {
        return this.data.reduce((max, current) => 
            current.pr > max.pr ? current : max
        );
    }

    updateTable() {
        console.log('Updating table...');
        const tbody = document.getElementById('jumpTableBody');
        if (!tbody) {
            console.error('Table body element not found!');
            return;
        }
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        const filteredData = this.data.filter(jumper => 
            jumper.name.toLowerCase().includes(searchTerm)
        );

        console.log('Filtered data for table:', filteredData.length, 'records');

        tbody.innerHTML = filteredData.map(jumper => `
            <tr>
                <td>${jumper.name}</td>
                <td>${jumper.average.toFixed(1)}"</td>
                <td>${jumper.pr.toFixed(1)}"</td>
                <td>${jumper.pr90.toFixed(1)}"</td>
                <td>${jumper.date.toLocaleDateString()}</td>
                <td>
                    <div class="jump-set">
                        ${jumper.set1Jumps.map(j => `<span>${j.toFixed(1)}"</span>`).join(', ')}
                    </div>
                </td>
                <td>
                    <div class="jump-set">
                        ${jumper.set2Jumps.map(j => `<span>${j.toFixed(1)}"</span>`).join(', ')}
                    </div>
                </td>
            </tr>
        `).join('');

        console.log('Table updated with HTML:', tbody.children.length, 'rows');
    }

    filterTable() {
        this.updateTable();
    }

    exportReport() {
        const reportData = this.data.map(jumper => ({
            Name: jumper.name,
            Average: jumper.average.toFixed(1),
            'Personal Record': jumper.pr.toFixed(1),
            '90% PR': jumper.pr90.toFixed(1),
            Date: jumper.date.toLocaleDateString(),
            'Set 1 Jumps': jumper.set1Jumps.map(j => j.toFixed(1)).join(', '),
            'Set 2 Jumps': jumper.set2Jumps.map(j => j.toFixed(1)).join(', ')
        }));

        // Create CSV content
        const headers = Object.keys(reportData[0]);
        const csvContent = [
            headers.join(','),
            ...reportData.map(row => headers.map(header => row[header]).join(','))
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `jump_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    updateDashboard() {
        console.log('Updating dashboard with data:', this.data.length, 'records');
        jumpCharts.updateDashboard(this.data);
        this.updateTable();
    }

    async loadSampleData() {
        try {
            const response = await fetch('data/CSV sample.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            this.parseCSV(csvText);
        } catch (error) {
            console.error('Error loading sample data:', error);
            alert('Could not load sample data. Please try uploading a file manually.');
        }
    }
}

const dataProcessor = new JumpDataProcessor(); 