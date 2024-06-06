document.addEventListener('DOMContentLoaded', () => {
    // Fetch data stored in localStorage
    const audits = JSON.parse(localStorage.getItem('dashboardInspections')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Initialize count objects for different metrics
    let locationCounts = {};
    let areaCounts = {};
    let scoreCounts = {
        'Non-Compliant': 0,
        'Partially Compliant': 0,
        'Fully Compliant': 0,
        'NA': 0
    };
    let findingTypesCounts = {};
    let assignToCounts = {};
    let statusCounts = {
        'Pending': 0,
        'In Progress': 0,
        'Resolved': 0
    };
    let findingsPerDateCounts = {};
    let findingsAssignedToCounts = {};
    let inspectionFrequencyLocation = {};
    let repeatFindingsCounts = {};
    let inspectionsFindingsTrend = {};

    // Total counters for dashboard metrics
    let totalUsers = users.length;
    let totalInspections = 0; // Count of inspection audits
    let totalFindings = 0;

    // Color map for findings
    const findingColors = {
        'General': 'rgba(75, 192, 192, 0.2)',
        'Signage': 'rgba(255, 159, 64, 0.2)',
        'Parking': 'rgba(255, 205, 86, 0.2)',
        'Internal and External Circulation': 'rgba(201, 203, 207, 0.2)',
        'Floors and Ground Surfaces': 'rgba(54, 162, 235, 0.2)',
        'Doorways, Doors and Handles': 'rgba(153, 102, 255, 0.2)',
        'Changes in Level': 'rgba(255, 99, 132, 0.2)',
        'Ramps': 'rgba(255, 159, 64, 0.2)',
        'Stairways': 'rgba(75, 192, 192, 0.2)',
        'Handrails': 'rgba(54, 162, 235, 0.2)',
        'Lifts': 'rgba(153, 102, 255, 0.2)',
        'Toilet Facilities': 'rgba(255, 205, 86, 0.2)',
        'Auditoriums, Halls and Grandstands': 'rgba(201, 203, 207, 0.2)',
        'Controls, Switches and Power Points': 'rgba(54, 162, 235, 0.2)',
        'Warning Signals': 'rgba(153, 102, 255, 0.2)',
        'Lighting': 'rgba(255, 99, 132, 0.2)'
    };

    // Process each audit to accumulate data
    audits.forEach(audit => {
        // Count inspections and findings for the trend chart
        inspectionsFindingsTrend[audit.date] = inspectionsFindingsTrend[audit.date] || { inspections: 0, findings: 0 };
        inspectionsFindingsTrend[audit.date].inspections++;

        audit.inspections.forEach(inspection => {
            // Increment location and area counts
            locationCounts[inspection.location] = (locationCounts[inspection.location] || 0) + 1;
            areaCounts[inspection.area] = (areaCounts[inspection.area] || 0) + 1;
            
            // Increment score and finding type counts
            scoreCounts[inspection.score] = (scoreCounts[inspection.score] || 0) + 1;
            findingTypesCounts[inspection.finding] = (findingTypesCounts[inspection.finding] || 0) + 1;

            // Increment assigned-to and status counts
            assignToCounts[inspection.assignedTo] = (assignToCounts[inspection.assignedTo] || 0) + 1;
            statusCounts[inspection.status] = (statusCounts[inspection.status] || 0) + 1;

            // Increment findings per date counts
            findingsPerDateCounts[audit.date] = (findingsPerDateCounts[audit.date] || 0) + 1;

            // Increment inspection frequency by location
            inspectionFrequencyLocation[inspection.location] = (inspectionFrequencyLocation[inspection.location] || 0) + 1;

            // Increment repeat findings
            repeatFindingsCounts[inspection.finding] = (repeatFindingsCounts[inspection.finding] || 0) + 1;

            // Increment findings for the trend chart
            inspectionsFindingsTrend[audit.date].findings++;

            // For the findings assigned to each user
            if (!findingsAssignedToCounts[inspection.assignedTo]) {
                findingsAssignedToCounts[inspection.assignedTo] = {};
            }
            findingsAssignedToCounts[inspection.assignedTo][inspection.finding] = 
                (findingsAssignedToCounts[inspection.assignedTo][inspection.finding] || 0) + 1;

            // Total findings increment
            totalFindings++;
        });
        totalInspections++;
    });

    // Map user IDs to user names for the "Assigned To" chart
    const assignToNames = {};
    Object.keys(assignToCounts).forEach(userId => {
        const user = users.find(user => user.id === userId);
        const userName = user ? `${user.firstName} ${user.lastName}` : `UserID: ${userId}`;
        assignToNames[userName] = assignToCounts[userId];
    });

    // Chart creation function
    function createChart(ctx, labels, data, label, type = 'pie', backgroundColors = []) {
        new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: backgroundColors.length ? backgroundColors : [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(255, 205, 86, 0.2)',
                        'rgba(201, 203, 207, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgb(75, 192, 192)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 205, 86)',
                        'rgb(201, 203, 207)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)',
                        'rgb(255, 99, 132)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: label
                    }
                }
            },
        });
    }

    // Create a stacked bar chart
    function createStackedBarChart(ctx, labels, datasets, label) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: label
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true
                    }
                }
            },
        });
    }

    // Create and display charts
    createChart(document.getElementById('totalUsersChart').getContext('2d'), ['Total Users'], [totalUsers], 'Total Users', 'bar');
    createChart(document.getElementById('totalInspectionsChart').getContext('2d'), ['Total Inspections'], [totalInspections], 'Total Inspections', 'bar');
    createChart(document.getElementById('totalFindingsChart').getContext('2d'), ['Total Findings'], [totalFindings], 'Total Findings', 'bar');
    createChart(document.getElementById('locationChart').getContext('2d'), Object.keys(locationCounts), Object.values(locationCounts), 'Locations');
    createChart(document.getElementById('areaChart').getContext('2d'), Object.keys(areaCounts), Object.values(areaCounts), 'Areas');
    createChart(document.getElementById('scoreChart').getContext('2d'), Object.keys(scoreCounts), Object.values(scoreCounts), 'Scores');
    createChart(document.getElementById('assignToChart').getContext('2d'), Object.keys(assignToNames), Object.values(assignToNames), 'Assigned To', 'bar');
    createChart(document.getElementById('statusChart').getContext('2d'), Object.keys(statusCounts), Object.values(statusCounts), 'Statuses', 'doughnut');
    createChart(document.getElementById('findingsPerDateChart').getContext('2d'), Object.keys(findingsPerDateCounts), Object.values(findingsPerDateCounts), 'Findings Per Date', 'line');
    createChart(document.getElementById('findingTypeChart').getContext('2d'), Object.keys(findingTypesCounts), Object.values(findingTypesCounts), 'Finding Types', 'pie', Object.keys(findingTypesCounts).map(key => findingColors[key]));

    // Create datasets for the findings assigned to each user chart
    const assignedToLabels = users.map(user => `${user.firstName} ${user.lastName}`);
    const findingsAssignedToDatasets = Object.keys(findingTypesCounts).map(findingType => {
        return {
            label: findingType,
            data: users.map(user => {
                const userId = user.id;
                return findingsAssignedToCounts[userId] ? findingsAssignedToCounts[userId][findingType] || 0 : 0;
            }),
            backgroundColor: findingColors[findingType],
            borderColor: findingColors[findingType].replace('0.2', '1'),
            borderWidth: 1
        };
    });

    // Create and display the findings assigned to each user chart
    createStackedBarChart(document.getElementById('findingsAssignedToChart').getContext('2d'), assignedToLabels, findingsAssignedToDatasets, 'Findings Assigned to Each User');

    // Create and display the inspection frequency by location chart
    createChart(document.getElementById('inspectionFrequencyLocationChart').getContext('2d'), Object.keys(inspectionFrequencyLocation), Object.values(inspectionFrequencyLocation), 'Inspection Frequency by Location', 'bar');

    // Create and display the repeat findings chart
    createChart(document.getElementById('repeatFindingsChart').getContext('2d'), Object.keys(repeatFindingsCounts), Object.values(repeatFindingsCounts), 'Repeat Findings', 'bar');

    // Create and display the inspections vs. findings trend chart
    const inspectionsFindingsLabels = Object.keys(inspectionsFindingsTrend);
    const inspectionsFindingsData = {
        inspections: inspectionsFindingsLabels.map(date => inspectionsFindingsTrend[date].inspections),
        findings: inspectionsFindingsLabels.map(date => inspectionsFindingsTrend[date].findings)
    };
    new Chart(document.getElementById('inspectionsFindingsTrendChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: inspectionsFindingsLabels,
            datasets: [
                {
                    label: 'Inspections',
                    data: inspectionsFindingsData.inspections,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                },
                {
                    label: 'Findings',
                    data: inspectionsFindingsData.findings,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Inspections vs. Findings Trend'
                }
            },
        }
    });

    // Export to PDF
    document.getElementById('exportButton').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('landscape');
        const charts = document.querySelectorAll('canvas');

        let y = 10;
        charts.forEach((chart, index) => {
            html2canvas(chart).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 10, y, 280, 150);
                y += 160;
                if (y >= 160) {
                    pdf.addPage();
                    y = 10;
                }
                if (index === charts.length - 1) {
                    pdf.save('charts.pdf');
                }
            });
        });
    });

    // Add download functionality to each download button
    document.querySelectorAll('.download-button').forEach(button => {
        button.addEventListener('click', () => {
            const chartId = button.getAttribute('data-chart-id');
            const chartCanvas = document.getElementById(chartId);
            html2canvas(chartCanvas).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = imgData;
                link.download = `${chartId}.png`;
                link.click();
            });
        });
    });
});


