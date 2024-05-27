function handleFormSubmit(event) {
    event.preventDefault();

    // Get form values
    const location = document.getElementById("location").value;
    const area = document.getElementById("area").value;
    const finding = document.getElementById("finding").value;
    const comment = document.getElementById("comment").value;
    const score = document.getElementById("score").value;
    const recommendation = document.getElementById("recommendation").value;
    let picture = null;

    // If a picture was selected, store it as a base64 string
    if (document.getElementById("picture").files.length > 0) {
        const file = document.getElementById("picture").files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            picture = event.target.result;
            saveInspectionData({ location, area, finding, comment, score, recommendation, picture });
            displayInspectionData(); // Display inspection data after saving
        };
        reader.readAsDataURL(file);
    } else {
        // Save inspection data to local storage without picture
        saveInspectionData({ location, area, finding, comment, score, recommendation });
        displayInspectionData(); // Display inspection data after saving
    }

    // Reset form fields
    document.getElementById("addInspectionForm").reset();
}

function saveInspectionData(inspection) {
    let inspections = JSON.parse(localStorage.getItem("inspections")) || [];
    inspections.push(inspection);
    localStorage.setItem("inspections", JSON.stringify(inspections));
}

function displayInspectionData() {
    const inspectionList = document.getElementById("inspectionList");
    inspectionList.innerHTML = "";

    let inspections = JSON.parse(localStorage.getItem("inspections")) || [];

    inspections.forEach((inspection, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <strong>Location:</strong> ${inspection.location}<br>
            <strong>Area:</strong> ${inspection.area}<br>
            <strong>Finding:</strong> ${inspection.finding}<br>
            <strong>Comment:</strong> ${inspection.comment}<br>
            <strong>Score:</strong> ${inspection.score}<br>
            <strong>Recommendation:</strong> ${inspection.recommendation}<br>
            <img src="${inspection.picture}" style="max-width: 100%;" alt="Inspection Picture">
        `;

        // Add Edit button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function() {
            editInspection(index);
        });
        listItem.appendChild(editButton);

        // Add Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function() {
            deleteInspection(index);
        });
        listItem.appendChild(deleteButton);

        inspectionList.appendChild(listItem);
    });
}

function editInspection(index) {
    let inspections = JSON.parse(localStorage.getItem("inspections")) || [];
    const inspectionToEdit = inspections[index];

    // Populate form fields with inspection data for editing
    document.getElementById("location").value = inspectionToEdit.location;
    document.getElementById("area").value = inspectionToEdit.area;
    document.getElementById("finding").value = inspectionToEdit.finding;
    document.getElementById("comment").value = inspectionToEdit.comment;
    document.getElementById("score").value = inspectionToEdit.score;
    document.getElementById("recommendation").value = inspectionToEdit.recommendation;

    // Update inspection data in the list instead of removing it
    document.getElementById("addInspectionForm").addEventListener("submit", function(event) {
        event.preventDefault();

        inspectionToEdit.location = document.getElementById("location").value;
        inspectionToEdit.area = document.getElementById("area").value;
        inspectionToEdit.finding = document.getElementById("finding").value;
        inspectionToEdit.comment = document.getElementById("comment").value;
        inspectionToEdit.score = document.getElementById("score").value;
        inspectionToEdit.recommendation = document.getElementById("recommendation").value;

        localStorage.setItem("inspections", JSON.stringify(inspections));

        // Display the updated list
        displayInspectionData();

        // Reset form fields
        document.getElementById("addInspectionForm").reset();
    });
}

function goToDashboard() {
    window.location.href = 'dashboard.html'; // Redirect to the dashboard page
}

function deleteInspection(index) {
    let inspections = JSON.parse(localStorage.getItem("inspections")) || [];
    inspections.splice(index, 1);
    localStorage.setItem("inspections", JSON.stringify(inspections));

    // Display the updated list
    displayInspectionData();
}

function openCamera() {
    const cameraContainer = document.getElementById("cameraContainer");
    cameraContainer.innerHTML = ""; // Clear previous content

    // Define constraints for the media stream to request the back camera
    const constraints = {
        video: { facingMode: "environment" } // 'environment' to request the rear camera
    };

    // Access the camera stream using defined constraints
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            // Create video element to display camera stream
            const video = document.createElement("video");
            video.srcObject = stream;
            video.autoplay = true;
            video.play();
            cameraContainer.appendChild(video);

            // Create button to capture picture
            const captureButton = document.createElement("button");
            captureButton.textContent = "Capture Picture";
            captureButton.addEventListener("click", function() {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const pictureData = canvas.toDataURL("image/png"); // Convert picture to base64 data URL
                
                // Save inspection data including the picture
                const location = document.getElementById("location").value;
                const area = document.getElementById("area").value;
                const finding = document.getElementById("finding").value;
                const comment = document.getElementById("comment").value;
                const score = document.getElementById("score").value;
                const recommendation = document.getElementById("recommendation").value;
                saveInspectionData({ location, area, finding, comment, score, recommendation, picture: pictureData });
                displayInspectionData(); // Display inspection data with the new picture
                cameraContainer.innerHTML = ""; // Clear camera container after capturing picture
                stream.getTracks().forEach(track => track.stop()); // Stop camera stream
            });
            cameraContainer.appendChild(captureButton);
        })
        .catch(function(err) {
            console.error("Error accessing the camera: " + err);
            alert("Could not access the camera. Please check device permissions and camera availability.");
        });
}

// Add event listener to "Open Camera" button
document.getElementById("openCamera").addEventListener("click", openCamera);


// Add event listener to form submission
document.getElementById("addInspectionForm").addEventListener("submit", handleFormSubmit);

// Display inspection data on page load
displayInspectionData();

function submitAllInspections() {
    let inspections = JSON.parse(localStorage.getItem("inspections")) || [];
    let dashboardInspections = JSON.parse(localStorage.getItem("dashboardInspections")) || [];

    // Create a new audit object with a unique ID and the current date
    const audit = {
        id: Date.now(), // Unique ID based on the current timestamp
        date: new Date().toLocaleDateString(), // Current date
        inspections: inspections // Array of inspections
    };

    // Add the new audit to the dashboard
    dashboardInspections.push(audit);
    localStorage.setItem("dashboardInspections", JSON.stringify(dashboardInspections));

    // Clear inspections from index.html
    localStorage.setItem("inspections", JSON.stringify([]));

    // Redirect to dashboard
    window.location.href = "dashboard.html";
}


// Add event listener to "Submit All Inspections" button
document.getElementById("submitAll").addEventListener("click", submitAllInspections);

// Add event listener to "Open Index" button in dashboard.html
document.getElementById("openIndex").addEventListener("click", function() {
    window.location.href = "index.html"; // Redirect to index.html
});

// Speech-to-text functionality
function startSpeechRecognition(textareaId) {
    if ('webkitSpeechRecognition' in window) {
        var recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.start();

        recognition.onresult = function(event) {
            var transcript = event.results[0][0].transcript;
            document.getElementById(textareaId).value = transcript;
        };

        recognition.onerror = function(event) {
            alert('Error occurred in recognition: ' + event.error);
        };

        recognition.onend = function() {
            console.log('Speech recognition has stopped.');
        };
    } else {
        alert('Your browser does not support Speech Recognition.');
    }
}

