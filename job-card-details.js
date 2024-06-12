document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('backToDashboard').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    displayJobCardDetails();
});

function goToJobcards() {
    window.location.href = 'job-cards.html';
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function displayJobCardDetails() {
    const jobCardData = JSON.parse(localStorage.getItem('currentJobCard'));
    const audits = JSON.parse(localStorage.getItem('dashboardInspections')) || [];
    const audit = audits[jobCardData.auditIndex];
    const finding = audit.inspections[jobCardData.findingIndex];

    const jobCardDetails = document.getElementById('jobCardDetails');
    jobCardDetails.innerHTML = `
        <h2>Job Card</h2>
        <p><strong>Date:</strong> ${audit.date}</p>
        <p><strong>Location:</strong> ${finding.location}</p>
        <p><strong>Area:</strong> ${finding.area}</p>
        <p><strong>Finding:</strong> ${finding.finding}</p>
        <p><strong>Score:</strong> ${finding.score}</p>
        <p><strong>Comment:</strong> ${finding.comment}</p>
        <p><strong>Recommendations:</strong> ${finding.recommendation}</p>
        ${finding.picture ? `<div class="image-container"><img src="${finding.picture}" alt="Finding Picture"></div>` : ''}
        <p><strong>Assign to:</strong> ${getUserName(finding.assignedTo)}</p>
    `;

    const actionsTakenCard = document.getElementById('actionsTakenCard');
    actionsTakenCard.innerHTML = `
        <h2>Actions Taken</h2>
        <textarea id="actionsTaken" rows="4" cols="50" placeholder="Describe actions taken...">${finding.actionsTaken || ''}</textarea>
        <label for="actionPicture">Upload Action Picture:</label>
        <input type="file" id="actionPicture" name="actionPicture" accept="image/*">
        ${finding.actionPicture ? `<div class="image-container"><img src="${finding.actionPicture}" alt="Action Picture"></div>` : ''}
        <button type="button" onclick="saveJobCardDetails(${jobCardData.auditIndex}, ${jobCardData.findingIndex})">Save</button>
    `;
}

function saveJobCardDetails(auditIndex, findingIndex) {
    const audits = JSON.parse(localStorage.getItem('dashboardInspections')) || [];
    const finding = audits[auditIndex].inspections[findingIndex];

    const actionsTaken = document.getElementById('actionsTaken').value;
    const actionPictureInput = document.getElementById('actionPicture');
    let actionPicture = finding.actionPicture || null;

    if (actionPictureInput.files.length > 0) {
        const file = actionPictureInput.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            actionPicture = event.target.result;
            finding.actionsTaken = actionsTaken;
            finding.actionPicture = actionPicture;
            localStorage.setItem('dashboardInspections', JSON.stringify(audits));
            alert('Job card details saved successfully.');
            displayJobCardDetails(); // Refresh the job card details to show the new action picture
        };
        reader.readAsDataURL(file);
    } else {
        finding.actionsTaken = actionsTaken;
        finding.actionPicture = actionPicture;
        localStorage.setItem('dashboardInspections', JSON.stringify(audits));
        alert('Job card details saved successfully.');
        displayJobCardDetails(); // Refresh the job card details
    }
}

function getUserName(userId) {
    const users = getUsers();
    const user = users.find(user => user.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
}
