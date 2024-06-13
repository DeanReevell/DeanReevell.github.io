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
        <button type="button" onclick="startSpeechRecognition('actionsTaken')">🎤 Speak</button>
        <label for="actionPicture"><strong>Upload Action Picture:</strong></label>
        <input type="file" id="actionPicture" name="actionPicture" accept="image/*">
        ${finding.actionPicture ? `<div class="image-container"><img src="${finding.actionPicture}" alt="Action Picture"></div>` : ''}
        <button type="button" onclick="openCamera()">Open Camera</button>
        <div id="cameraContainer"></div>
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

function startSpeechRecognition(textareaId) {
    if ('webkitSpeechRecognition' in window) {
        var recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.start();

        recognition.onresult = function(event) {
            var transcript = event.results[0][0].transcript;
            document.getElementById(textareaId).value += transcript;
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

function openCamera() {
    const cameraContainer = document.getElementById('cameraContainer');
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
                
                // Display the captured picture
                const imageContainer = document.createElement("div");
                imageContainer.className = "image-container";
                const img = document.createElement("img");
                img.src = pictureData;
                imageContainer.appendChild(img);
                cameraContainer.innerHTML = ""; // Clear the video stream
                cameraContainer.appendChild(imageContainer);

                // Save the captured picture
                const actionPictureInput = document.getElementById('actionPicture');
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(new File([dataURItoBlob(pictureData)], "captured.png"));
                actionPictureInput.files = dataTransfer.files;

                stream.getTracks().forEach(track => track.stop()); // Stop the camera stream
            });
            cameraContainer.appendChild(captureButton);
        })
        .catch(function(err) {
            console.error("Error accessing the camera: " + err);
            alert("Could not access the camera. Please check device permissions and camera availability.");
        });
}

// Convert base64/URLEncoded data component to raw binary data held in a string
function dataURItoBlob(dataURI) {
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
}
