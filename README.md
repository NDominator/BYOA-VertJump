# Vertical Jump Analytics Dashboard

A web-based dashboard for tracking and visualizing vertical jump performance data for Altamont Lutheran Interparish School.

## Demo

View the live demo: [https://ndominator.github.io/BYOA-VertJump/](https://ndominator.github.io/BYOA-VertJump/)

## Features

- Automatic loading of sample jump data
- Top 3 jumpers display
- Most improved athletes tracking
- Overall champion highlighting
- Detailed jump data table
- CSV export functionality
- Search and filter capabilities

## Setup

1. Clone the repository
2. Open `docs/index.html` in a web browser
3. The sample data will load automatically

## Repository Structure

```
docs/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── dataProcessor.js
│   └── charts.js
├── data/
│   └── CSV sample.csv
└── assets/
    └── altamont-logo.png
```

## Data Format

The dashboard expects CSV files with the following columns:
- NAME
- Average
- PR
- 90% PR
- Date
- Set 1 (3 jumps)
- Set 2 (3 jumps)
