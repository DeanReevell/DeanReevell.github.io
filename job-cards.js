document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('backToDashboard').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    document.getElementById('searchInput').addEventListener('input', searchJobCards);

    populateJobCards();
});

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function populateJobCards() {
    const jobCardsContainer = document.getElementById('jobCardsContainer');
    jobCardsContainer.innerHTML = '';

    let findings = JSON.parse(localStorage.getItem('dashboardInspections')) || [];
    findings.forEach((audit, auditIndex) => {
        audit.inspections.forEach((finding, findingIndex) => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            jobCard.dataset.date = audit.date;
            jobCard.dataset.location = finding.location;
            jobCard.dataset.area = finding.area;
            jobCard.dataset.finding = finding.finding;
            jobCard.dataset.comment = finding.comment;
            jobCard.dataset.score = finding.score;
            jobCard.dataset.assignedTo = getUserName(finding.assignedTo).toLowerCase();
            jobCard.dataset.status = finding.status || 'Unassigned';

            jobCard.innerHTML = `
                <h3>Finding #${findingIndex + 1}</h3>
                <p><strong>Date:</strong> ${audit.date}</p>
                <p><strong>Location:</strong> ${finding.location}</p>
                <p><strong>Area:</strong> ${finding.area}</p>
                <p><strong>Finding:</strong> ${finding.finding}</p>
                <p><strong>Score:</strong> ${finding.score}</p>
                <p><strong>Comments:</strong> ${finding.comment || 'No comments'}</p>
                <p><strong>Recommendations:</strong> ${finding.recommendation || 'No recommendations'}</p>
                <p><strong>Assign to:</strong> ${getUserName(finding.assignedTo)}</p>
                ${finding.picture ? `<div class="image-container"><img src="${finding.picture}" alt="Finding Picture"></div>` : ''}
                <button onclick="openJobCard(${auditIndex}, ${findingIndex})">View Details</button>
            `;
            jobCardsContainer.appendChild(jobCard);
        });
    });

    updateFindingCount();
}

function openJobCard(auditIndex, findingIndex) {
    const jobCardData = {
        auditIndex: auditIndex,
        findingIndex: findingIndex
    };
    localStorage.setItem('currentJobCard', JSON.stringify(jobCardData));
    window.location.href = 'job-card-details.html';
}

function getUserName(userId) {
    const users = getUsers();
    const user = users.find(user => user.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
}

function searchJobCards() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const jobCards = document.querySelectorAll('.job-card');
    let found = false;

    jobCards.forEach(jobCard => {
        const location = jobCard.dataset.location.toLowerCase();
        const area = jobCard.dataset.area.toLowerCase();
        const finding = jobCard.dataset.finding.toLowerCase();
        const comment = jobCard.dataset.comment.toLowerCase();
        const date = jobCard.dataset.date;
        const score = jobCard.dataset.score.toLowerCase();
        const assignedTo = jobCard.dataset.assignedTo.toLowerCase();

        if (
            location.includes(searchInput) ||
            area.includes(searchInput) ||
            finding.includes(searchInput) ||
            comment.includes(searchInput) ||
            date.includes(searchInput) ||
            score.includes(searchInput) ||
            assignedTo.includes(searchInput)
        ) {
            jobCard.style.display = 'block';
            found = true;
        } else {
            jobCard.style.display = 'none';
        }
    });

    const noResultsMessage = document.getElementById('noResultsMessage');
    if (!found) {
        if (!noResultsMessage) {
            const message = document.createElement('p');
            message.id = 'noResultsMessage';
            message.textContent = 'Oops, there is no such thing in the system';
            message.style.textAlign = 'center';
            document.getElementById('jobCardsContainer').appendChild(message);
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }

    updateFindingCount();
}

function filterByDate() {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    const jobCards = document.querySelectorAll('.job-card');
    let found = false;

    jobCards.forEach(jobCard => {
        const jobDate = new Date(jobCard.dataset.date);
        if (jobDate >= startDate && jobDate <= endDate) {
            jobCard.style.display = 'block';
            found = true;
        } else {
            jobCard.style.display = 'none';
        }
    });

    const noResultsMessage = document.getElementById('noResultsMessage');
    if (!found) {
        if (!noResultsMessage) {
            const message = document.createElement('p');
            message.id = 'noResultsMessage';
            message.textContent = 'Oops, there is no such thing in the system';
            message.style.textAlign = 'center';
            document.getElementById('jobCardsContainer').appendChild(message);
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }

    updateFindingCount();
}

function filterByTag(tag) {
    const jobCards = document.querySelectorAll('.job-card');
    let found = false;

    jobCards.forEach(jobCard => {
        if (jobCard.dataset.status.toLowerCase() === tag.toLowerCase()) {
            jobCard.style.display = 'block';
            found = true;
        } else {
            jobCard.style.display = 'none';
        }
    });

    const noResultsMessage = document.getElementById('noResultsMessage');
    if (!found) {
        if (!noResultsMessage) {
            const message = document.createElement('p');
            message.id = 'noResultsMessage';
            message.textContent = 'Oops, there is no such thing in the system';
            message.style.textAlign = 'center';
            document.getElementById('jobCardsContainer').appendChild(message);
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }

    updateFindingCount();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    populateJobCards();
}

function updateFindingCount() {
    const jobCards = document.querySelectorAll('.job-card');
    const visibleCards = Array.from(jobCards).filter(jobCard => jobCard.style.display !== 'none');
    document.getElementById('findingCount').textContent = `Total Findings: ${visibleCards.length}`;
}
