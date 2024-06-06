document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');

    hamburgerMenu.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        content.classList.toggle('active');
    });

    displayInspectionTable();
    populateInspectionOverviewTable();
    updateAssignmentsAndStatus(); // Initial call to update tags
});

// Function to fetch user data from local storage
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function displayInspectionTable() {
    const inspectionTableBody = document.getElementById("inspectionTableBody");
    inspectionTableBody.innerHTML = "";

    let dashboardInspections = JSON.parse(localStorage.getItem("dashboardInspections")) || [];

    dashboardInspections.forEach((audit, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${audit.date}</td>
            <td>Inspection Audit #${index + 1}</td>
            <td>
                <button onclick="viewAudit(${audit.id})">View</button>
                <button onclick="confirmDeleteAudit(${audit.id})">Delete</button>
            </td>
        `;
        inspectionTableBody.appendChild(row);
    });
}

function viewAudit(auditId) {
    window.location.href = `auditDetails.html?id=${auditId}`;
}

function confirmDeleteAudit(auditId) {
    if (confirm("Are you sure you want to delete this Inspection Audit?")) {
        deleteAudit(auditId);
    }
}

function deleteAudit(auditId) {
    let dashboardInspections = JSON.parse(localStorage.getItem("dashboardInspections")) || [];
    const index = dashboardInspections.findIndex(audit => audit.id === auditId);

    if (index !== -1) {
        dashboardInspections.splice(index, 1);
        localStorage.setItem("dashboardInspections", JSON.stringify(dashboardInspections));
        displayInspectionTable();
        updateAssignmentsAndStatus(); // Update tags after deletion
    } else {
        alert("Audit not found!");
    }
}

function populateInspectionOverviewTable() {
    const audits = JSON.parse(localStorage.getItem("dashboardInspections")) || [];
    const tableBody = document.querySelector("#inspectionOverview #inspectionTable tbody");
    tableBody.innerHTML = ""; // Clear existing table data

    audits.forEach((audit, auditIndex) => {
        audit.inspections.forEach((inspection, inspectionIndex) => {
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = audit.date;
            row.insertCell(1).textContent = inspection.location;
            row.insertCell(2).textContent = inspection.area;
            row.insertCell(3).textContent = inspection.finding;
            row.insertCell(4).textContent = inspection.score;

            const assignCell = row.insertCell(5);
            populateEmployeeDropdown(assignCell, inspection.assignedTo, auditIndex, inspectionIndex);

            const statusCell = row.insertCell(6);
            const selectStatus = document.createElement('select');
            selectStatus.innerHTML = `<option value="">Select Status</option>
                                      <option value="Pending">Pending</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Resolved">Resolved</option>
                                      <option value="No Status">No Status</option>`;
            selectStatus.value = inspection.status || "";
            selectStatus.onchange = (e) => {
                updateStatus(auditIndex, inspectionIndex, e.target.value);
                updateAssignmentsAndStatus(); // Update tags when status changes
            };
            statusCell.appendChild(selectStatus);

            const recommendationsCell = row.insertCell(7);
            recommendationsCell.textContent = inspection.recommendation || 'No recommendation'; // New Recommendations Cell
        });
    });

    updateAssignmentsAndStatus(); // Update tags after populating table
}

function populateEmployeeDropdown(cell, assignedTo, auditIndex, inspectionIndex) {
    const users = getUsers();
    const select = document.createElement('select');
    select.innerHTML = `<option value="">Select Employee</option>`;
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.firstName} ${user.lastName}`;
        if (user.id === assignedTo) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    select.onchange = (e) => {
        assignToEmployee(auditIndex, inspectionIndex, e.target.value);
        updateAssignmentsAndStatus(); // Update tags when assigned to changes
    };
    cell.appendChild(select);
}

function assignToEmployee(auditIndex, inspectionIndex, employee) {
    const audits = JSON.parse(localStorage.getItem("dashboardInspections")) || [];
    audits[auditIndex].inspections[inspectionIndex].assignedTo = employee;
    updateStatus(auditIndex, inspectionIndex, "Assigned"); // Automatically update status to 'Assigned' when an employee is selected
    localStorage.setItem("dashboardInspections", JSON.stringify(audits));
    console.log("Assigned Inspection:", audits[auditIndex].inspections[inspectionIndex]);
    updateAssignmentsAndStatus(); // Update tags after assignment
}

function updateStatus(auditIndex, inspectionIndex, status) {
    const audits = JSON.parse(localStorage.getItem("dashboardInspections")) || [];
    audits[auditIndex].inspections[inspectionIndex].status = status;
    localStorage.setItem("dashboardInspections", JSON.stringify(audits));
    console.log("Updated Status:", audits[auditIndex].inspections[inspectionIndex]);
    updateAssignmentsAndStatus(); // Update tags after status update
}

function filterTable() {
    const input = document.querySelector("#inspectionOverview #filterInput");
    const filter = input.value.toUpperCase();
    const table = document.querySelector("#inspectionOverview #inspectionTable");
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        let displayRow = false; // Assume the row will not be displayed
        for (let j = 0; j < tr[i].cells.length; j++) {
            const cell = tr[i].cells[j];
            let cellText = cell.textContent || cell.innerText;
            if (cell.querySelector('select')) {
                cellText = cell.querySelector('select').selectedOptions[0].text;
            }
            if (cellText.toUpperCase().indexOf(filter) > -1) {
                displayRow = true;
                break; // Found a match, no need to check further cells
            }
        }
        tr[i].style.display = displayRow ? "" : "none";
    }
}

////////////////////////////////////////////////////////////////

function getFormattedDate() {
    const date = new Date();
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

document.getElementById('exportToPDF').addEventListener('click', function() {
    const filterInputValue = document.getElementById('filterInput').value; // Assume there's an input for filtering
    const formattedDate = getFormattedDate();
    const filename = `Inspection_Overview_${formattedDate}_${filterInputValue.replace(/\s+/g, '_')}.pdf`;

    const inspectionOverview = document.getElementById('inspectionOverview'); // Target the correct section
    html2canvas(inspectionOverview, { scale: 2, scrollY: -window.scrollY }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait', // Set to portrait orientation
            unit: 'mm',
            format: 'a4'
        });

        // Settings for A4 portrait
        var imgWidth = 190; // approximately the full width of A4 paper in mm
        var pageHeight = 277;  // adjusted page height considering margins in mm
        var imgHeight = canvas.height * imgWidth / canvas.width;
        var heightLeft = imgHeight;
        var position = 0; // top position of image

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight; // top position of next page
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        pdf.save(filename);
    }).catch(err => {
        console.error('Error exporting to PDF:', err);
    });
});

//////////////////////////////////////////////////////////////////////////////////

function updateAssignmentsAndStatus() {
    const audits = JSON.parse(localStorage.getItem("dashboardInspections")) || [];
    let userAssignments = {};
    let unassignedCount = 0;  // Counter for unassigned inspections
    let statusCounts = {
        'Pending': 0,
        'In Progress': 0,
        'Resolved': 0,
        'No Status': 0 // Counter for no status
    };
    let scoreCounts = {
        'Non-Compliant': 0,
        'Partially Compliant': 0,
        'Fully Compliant': 0,
        'NA': 0
    };

    // Iterate through all audits and inspections to tally assignments, statuses, and scores
    audits.forEach(audit => {
        audit.inspections.forEach(inspection => {
            if (inspection.assignedTo) {
                userAssignments[inspection.assignedTo] = (userAssignments[inspection.assignedTo] || 0) + 1;
            } else {
                unassignedCount += 1;  // Increment if no user is assigned
            }
            if (inspection.status) {
                statusCounts[inspection.status] = (statusCounts[inspection.status] || 0) + 1;
            }
            if (!inspection.status) {
                statusCounts['No Status'] += 1; // Increment for no status
            }
            if (inspection.score) {
                scoreCounts[inspection.score] = (scoreCounts[inspection.score] || 0) + 1;
            }
        });
    });

    // Update DOM for assignments
    const users = getUsers();
    const assignmentsSummaryElement = document.getElementById('assignmentsSummary');
    assignmentsSummaryElement.innerHTML = ''; // Clear existing content
    Object.keys(userAssignments).forEach(userId => {
        const user = users.find(user => user.id === userId);
        const userTag = document.createElement('span');
        userTag.className = 'tag user-tag';
        userTag.textContent = `${user ? user.firstName + ' ' + user.lastName : 'UserID: ' + userId} (${userAssignments[userId]})`;
        assignmentsSummaryElement.appendChild(userTag);
    });

    // Add tag for unassigned inspections if any
    if (unassignedCount > 0) {
        const unassignedTag = document.createElement('span');
        unassignedTag.className = 'tag user-tag';  // Consider creating a specific style for unassigned tags
        unassignedTag.textContent = `Unassigned (${unassignedCount})`;
        assignmentsSummaryElement.appendChild(unassignedTag);
    }

    // Update DOM for statuses
    const statusCountsElement = document.getElementById('statusCounts');
    statusCountsElement.innerHTML = ''; // Clear existing content
    Object.keys(statusCounts).forEach(status => {
        const statusTag = document.createElement('span');
        statusTag.className = `tag status-${status.toLowerCase().replace(/\s+/g, '-')}`;
        statusTag.textContent = `${status} (${statusCounts[status]})`;
        statusCountsElement.appendChild(statusTag);
    });

    // Update DOM for scores
    const scoreTagsElement = document.getElementById('scoreTags');
    scoreTagsElement.innerHTML = ''; // Clear existing content
    Object.keys(scoreCounts).forEach(score => {
        const scoreTag = document.createElement('span');
        scoreTag.className = `tag score-${score.toLowerCase().replace(/\s+/g, '-')}`;
        scoreTag.textContent = `${score} (${scoreCounts[score]})`;
        scoreTagsElement.appendChild(scoreTag);
    });
}

// Add event listener for "View Charts" button
document.getElementById("viewCharts").addEventListener("click", function() {
    window.location.href = "charts.html";
});

// Call this function whenever you update the table or initially load the dashboard
updateAssignmentsAndStatus();

document.getElementById("openIndex").addEventListener("click", function() {
    window.location.href = "index.html";
});

document.getElementById("Users").addEventListener("click", function() {
    window.location.href = "users.html";
});
