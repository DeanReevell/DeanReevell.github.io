document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const editUserId = document.getElementById('editUserId').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (editUserId) {
        // Edit existing user
        const userIndex = users.findIndex(user => user.id === editUserId);
        if (userIndex !== -1) {
            users[userIndex].firstName = firstName;
            users[userIndex].lastName = lastName;
        }
    } else {
        // Add new user
        const user = {
            id: Date.now().toString(), // Unique ID for each user
            firstName: firstName,
            lastName: lastName
        };
        users.push(user);
    }

    localStorage.setItem('users', JSON.stringify(users));
    displayUsers();
    this.reset();
    document.getElementById('editUserId').value = ''; // Reset hidden input for edit
});



function displayUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';

    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <p>${user.firstName} ${user.lastName}</p>
            <button onclick="editUser('${user.id}')">Edit</button>
            <button onclick="deleteUser('${user.id}')">Delete</button>
        `;
        usersList.appendChild(card);
    });
}

function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.id === userId);
    if (user) {
        document.getElementById('firstName').value = user.firstName;
        document.getElementById('lastName').value = user.lastName;
        document.getElementById('editUserId').value = user.id; // Set user ID in hidden input for tracking
    }
}

function deleteUser(userId) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(user => user.id !== userId);
    localStorage.setItem('users', JSON.stringify(users));
    displayUsers();
}

document.addEventListener('DOMContentLoaded', function() {
    displayUsers();
});

function goToDashboard() {
    window.location.href = 'dashboard.html'; // Redirect to the dashboard page
}

document.getElementById('clearUsers').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all users? This action cannot be undone.')) {
        localStorage.removeItem('users');  // Clear users from local storage
        displayUsers();  // Refresh the user list display
    }
});




