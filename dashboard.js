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
                <button onclick="deleteAudit(${audit.id})">Delete</button>
            </td>
        `;
        inspectionTableBody.appendChild(row);
    });
}

function viewAudit(auditId) {
    window.location.href = `auditDetails.html?id=${auditId}`;
}

function deleteAudit(auditId) {
    let dashboardInspections = JSON.parse(localStorage.getItem("dashboardInspections")) || [];
    const index = dashboardInspections.findIndex(audit => audit.id === auditId);

    if (index !== -1) {
        dashboardInspections.splice(index, 1);
        localStorage.setItem("dashboardInspections", JSON.stringify(dashboardInspections));
        displayInspectionTable();
    } else {
        alert("Audit not found!");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    displayInspectionTable();
    populateInspectionOverviewTable();
});

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
            selectStatus.innerHTML = `<option value="Pending">Pending</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Resolved">Resolved</option>`;
            selectStatus.value = inspection.status || "Pending";
            selectStatus.onchange = (e) => updateStatus(auditIndex, inspectionIndex, e.target.value);
            statusCell.appendChild(selectStatus);
        });
    });
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
    select.onchange = (e) => assignToEmployee(auditIndex, inspectionIndex, e.target.value);
    cell.appendChild(select);
}

function assignToEmployee(auditIndex, inspectionIndex, employee) {
    const audits = JSON.parse(localStorage.getItem("dashboardInspections")) || [];
    audits[auditIndex].inspections[inspectionIndex].assignedTo = employee;
    updateStatus(auditIndex, inspectionIndex, "Assigned"); // Automatically update status to 'Assigned' when an employee is selected
    localStorage.setItem("dashboardInspections", JSON.stringify(audits));
    console.log("Assigned Inspection:", audits[auditIndex].inspections[inspectionIndex]);
}

function updateStatus(auditIndex, inspectionIndex, status) {
    const audits = JSON.parse(localStorage.getItem("dashboardInspections")) || [];
    audits[auditIndex].inspections[inspectionIndex].status = status;
    localStorage.setItem("dashboardInspections", JSON.stringify(audits));
    console.log("Updated Status:", audits[auditIndex].inspections[inspectionIndex]);
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

document.getElementById("openIndex").addEventListener("click", function() {
    window.location.href = "index.html";
});

document.getElementById("Users").addEventListener("click", function() {
    window.location.href = "users.html";
});
