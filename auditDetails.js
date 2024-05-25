function displayAuditDetails(auditId) {
    const auditDetailsSection = document.getElementById("auditDetails");
    auditDetailsSection.innerHTML = "";

    let dashboardInspections = JSON.parse(localStorage.getItem("dashboardInspections")) || [];
    const audit = dashboardInspections.find(audit => audit.id === auditId);

    if (audit) {
        // Initialize counters for each category
        const locationCounts = {};
        const areaCounts = {};
        const findingCounts = {};
        const scoreCounts = {};

        // Count occurrences for each category
        audit.inspections.forEach(inspection => {
            locationCounts[inspection.location] = (locationCounts[inspection.location] || 0) + 1;
            areaCounts[inspection.area] = (areaCounts[inspection.area] || 0) + 1;
            findingCounts[inspection.finding] = (findingCounts[inspection.finding] || 0) + 1;
            scoreCounts[inspection.score] = (scoreCounts[inspection.score] || 0) + 1;
        });

        // Create HTML elements to display the counts in a table
        const countsSection = document.createElement("div");
        countsSection.innerHTML = `
            <h3>Summary:</h3>
            <table>
                <tr>
                    <th>Category</th>
                    <th>Detail</th>
                    <th>Count</th>
                </tr>
                ${Object.entries(locationCounts).map(([key, value]) => `<tr><td>Location</td><td>${key}</td><td>${value}</td></tr>`).join('')}
                ${Object.entries(areaCounts).map(([key, value]) => `<tr><td>Area</td><td>${key}</td><td>${value}</td></tr>`).join('')}
                ${Object.entries(findingCounts).map(([key, value]) => `<tr><td>Finding</td><td>${key}</td><td>${value}</td></tr>`).join('')}
                ${Object.entries(scoreCounts).map(([key, value]) => `<tr><td>Score</td><td>${key}</td><td>${value}</td></tr>`).join('')}
            </table>
        `;
        auditDetailsSection.insertBefore(countsSection, auditDetailsSection.firstChild);

        const auditInfo = document.createElement("div");
        auditInfo.innerHTML = `
            <h2>Audit Date: ${audit.date}</h2>
            <h3>Inspections:</h3>
            <ul>
                ${audit.inspections.map((inspection, index) => `
                    <li id="inspection-${index}">
                        <table>
                            <tr>
                                <td>Location:</td>
                                <td>${inspection.location}</td>
                            </tr>
                            <tr>
                                <td>Area:</td>
                                <td>${inspection.area}</td>
                            </tr>
                            <tr>
                                <td>Finding:</td>
                                <td>${inspection.finding}</td>
                            </tr>
                            <tr>
                                <td>Comment:</td>
                                <td>${inspection.comment}</td>
                            </tr>
                            <tr>
                                <td>Score:</td>
                                <td>${inspection.score}</td>
                            </tr>
                            <tr>
                                <td>Recommendation:</td>
                                <td>${inspection.recommendation}</td>
                            </tr>
                        </table>
                        ${inspection.picture ? `<img src="${inspection.picture}" style="max-width: 100%;" alt="Inspection Picture">` : ''}
                        <button onclick="editInspection(${auditId}, ${index})">Edit</button>
                        <button onclick="deleteInspection(${auditId}, ${index})">Delete</button>
                    </li>
                `).join('')}
            </ul>
        `;
        auditDetailsSection.appendChild(auditInfo);
    } else {
        auditDetailsSection.innerHTML = "<p>Audit not found.</p>";
    }
}

function goToDashboard() {
    window.location.href = 'dashboard.html'; // Redirect to the dashboard page
}

function editInspection(auditId, inspectionIndex) {
    let dashboardInspections = JSON.parse(localStorage.getItem("dashboardInspections")) || [];
    const audit = dashboardInspections.find(audit => audit.id === auditId);

    if (audit) {
        const inspection = audit.inspections[inspectionIndex];

        // Populate the form with the current inspection details
        document.getElementById("editLocation").value = inspection.location;
        document.getElementById("editArea").value = inspection.area;
        document.getElementById("editFinding").value = inspection.finding;
        document.getElementById("editComment").value = inspection.comment;
        document.getElementById("editScore").value = inspection.score;
        document.getElementById("editRecommendation").value = inspection.recommendation;

        // Show the modal
        const modal = document.getElementById("editModal");
        modal.style.display = "block";

        // Handle form submission
        document.getElementById("editInspectionForm").onsubmit = function(event) {
            event.preventDefault();

            // Update the inspection details
            inspection.location = document.getElementById("editLocation").value;
            inspection.area = document.getElementById("editArea").value;
            inspection.finding = document.getElementById("editFinding").value;
            inspection.comment = document.getElementById("editComment").value;
            inspection.score = document.getElementById("editScore").value;
            inspection.recommendation = document.getElementById("editRecommendation").value;

            // Handle picture update
            const pictureInput = document.getElementById("editPicture");
            if (pictureInput.files.length > 0) {
                const file = pictureInput.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    inspection.picture = e.target.result;
                    localStorage.setItem("dashboardInspections", JSON.stringify(dashboardInspections));
                    displayAuditDetails(auditId); // Refresh the audit details
                    modal.style.display = "none"; // Close the modal
                };
                reader.readAsDataURL(file);
            } else {
                localStorage.setItem("dashboardInspections", JSON.stringify(dashboardInspections));
                displayAuditDetails(auditId); // Refresh the audit details
                modal.style.display = "none"; // Close the modal
            }
        };

        // Close the modal when the user clicks on <span> (x)
        document.querySelector(".close").onclick = function() {
            modal.style.display = "none";
        };

        // Close the modal when the user clicks anywhere outside of the modal
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        };
    } else {
        alert("Audit not found!");
    }
}

function deleteInspection(auditId, inspectionIndex) {
    let dashboardInspections = JSON.parse(localStorage.getItem("dashboardInspections")) || [];
    const audit = dashboardInspections.find(audit => audit.id === auditId);

    if (audit) {
        if (confirm("Are you sure you want to delete this inspection?")) {
            audit.inspections.splice(inspectionIndex, 1);
            localStorage.setItem("dashboardInspections", JSON.stringify(dashboardInspections));
            displayAuditDetails(auditId); // Refresh the audit details
        }
    } else {
        alert("Audit not found!");
    }
}

function showAddFindingModal() {
    const modal = document.getElementById("addFindingModal");
    modal.style.display = "block";

    document.querySelector('.closeAddFinding').onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}

document.getElementById("addFindingForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const newLocation = document.getElementById("newLocation").value;
    const newArea = document.getElementById("newArea").value;
    const newFinding = document.getElementById("newFinding").value;
    const newComment = document.getElementById("newComment").value;
    const newScore = document.getElementById("newScore").value;
    const newRecommendation = document.getElementById("newRecommendation").value;

    let newPicture = "";
    const pictureInput = document.getElementById("newPicture");

    let dashboardInspections = JSON.parse(localStorage.getItem("dashboardInspections")) || [];
    const audit = dashboardInspections.find(audit => audit.id === auditId);

    const reader = new FileReader();
    reader.onload = function(event) {
        newPicture = event.target.result;

        if (audit) {
            const newInspection = {
                location: newLocation,
                area: newArea,
                finding: newFinding,
                comment: newComment,
                picture: newPicture,
                score: newScore,
                recommendation: newRecommendation
            };
            audit.inspections.push(newInspection);
            localStorage.setItem("dashboardInspections", JSON.stringify(dashboardInspections));
            displayAuditDetails(auditId);
        }
        document.getElementById("addFindingModal").style.display = "none";
    };

    if (pictureInput.files.length > 0) {
        reader.readAsDataURL(pictureInput.files[0]);
    } else {
        newPicture = ""; // Handle case where no picture is uploaded
        reader.onload(); // Trigger the onload function manually
    }
});



// Get the audit ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const auditId = parseInt(urlParams.get('id'));
displayAuditDetails(auditId);

// Save as PDF function
document.getElementById("saveAsPdf").addEventListener("click", function() {
    const auditDetails = document.getElementById("auditDetails");
    
    html2canvas(auditDetails).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('audit-details.pdf');
    });
});
