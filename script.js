const ROLEPLAY_COOLDOWN = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const PROFANITY_LIST = [
    'f***',
    's***',
    'b****',
    'a**',
    'c***',
    'h***',
    'd***',
    'n****',
    'p***',
    'w****'
]; // Add your list of bad words here

// Replace 'ownerUsername' with the actual owner's username
const OWNER_USERNAME = 'ownerUsername'; // Change this to the owner's username
let currentUser = 'ownerUsername'; // Set this to the current user's username for testing purposes

document.getElementById('roleplay-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Check for cooldown
    const lastRoleplayTime = localStorage.getItem('lastRoleplayTime');
    const now = Date.now();

    if (currentUser !== OWNER_USERNAME) {
        if (lastRoleplayTime && (now - lastRoleplayTime < ROLEPLAY_COOLDOWN)) {
            const remainingTime = ROLEPLAY_COOLDOWN - (now - lastRoleplayTime);
            alert(`You must wait ${Math.ceil(remainingTime / 1000 / 60)} minutes before creating another roleplay.`);
            return;
        }
    }

    // Gather form data
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    const neighborhoodCode = document.getElementById('neighborhood-code').value;

    // Profanity check for all users, including the owner
    if (containsProfanity(title) || containsProfanity(description)) {
        alert("Please avoid using inappropriate language in the title or description.");
        return;
    }

    // Handle image upload
    const imageInput = document.getElementById('image');
    const imageFile = imageInput.files[0];

    // Image file type check
    if (imageFile && !validateImageType(imageFile.name)) {
        alert("Please upload a valid image file (jpg, jpeg, png).");
        return;
    }

    // Create a roleplay object
    const roleplay = {
        title,
        description,
        date,
        neighborhoodCode,
        image: imageFile ? URL.createObjectURL(imageFile) : null
    };

    // Save the roleplay to local storage
    saveRoleplay(roleplay);
    if (currentUser !== OWNER_USERNAME) {
        localStorage.setItem('lastRoleplayTime', Date.now()); // Update last roleplay time
    }

    // Reset the form
    e.target.reset();
});

// Function to check for profanity
function containsProfanity(text) {
    return PROFANITY_LIST.some(badWord => {
        // Create a regex pattern to match the bad word, allowing for variations (like "f***" or "fuck")
        const pattern = badWord.replace(/\*/g, '.'); // Replace * with . to match any character
        const regex = new RegExp(`\\b${pattern}\\b`, 'i'); // Word boundary and case-insensitive
        return regex.test(text);
    });
}

// Function to validate image file types
function validateImageType(fileName) {
    const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    return allowedExtensions.test(fileName);
}

function saveRoleplay(roleplay) {
    const roleplays = JSON.parse(localStorage.getItem('roleplays')) || [];
    roleplays.push(roleplay);
    localStorage.setItem('roleplays', JSON.stringify(roleplays));
    displayRoleplays();
}

// Function to display roleplays
function displayRoleplays() {
    const roleplays = JSON.parse(localStorage.getItem('roleplays')) || [];
    const roleplayContainer = document.getElementById('roleplay-container');
    roleplayContainer.innerHTML = '';

    roleplays.forEach((roleplay, index) => {
        const roleplayItem = document.createElement('div');
        roleplayItem.className = 'roleplay-item';
        roleplayItem.innerHTML = `
            <h3>${roleplay.title}</h3>
            <p>${roleplay.description}</p>
            <p><strong>Date:</strong> ${roleplay.date}</p>
            <p><strong>Neighborhood Code:</strong> ${roleplay.neighborhoodCode}</p>
            ${roleplay.image ? `<img src="${roleplay.image}" alt="${roleplay.title}" style="max-width: 100px;">` : ''}
            <button onclick="deleteRoleplay(${index})">Delete</button>
        `;
        roleplayContainer.appendChild(roleplayItem);
    });
}

// Function to delete a roleplay
function deleteRoleplay(index) {
    const roleplays = JSON.parse(localStorage.getItem('roleplays')) || [];
    roleplays.splice(index, 1);
    localStorage.setItem('roleplays', JSON.stringify(roleplays));
    displayRoleplays();
}

// Update cooldown timer on load
function updateCooldownTimer() {
    const lastRoleplayTime = localStorage.getItem('lastRoleplayTime');
    if (lastRoleplayTime) {
        const now = Date.now();
        const timePassed = now - lastRoleplayTime;
        const remainingTime = ROLEPLAY_COOLDOWN - timePassed;

        if (remainingTime > 0) {
            const minutes = Math.floor((remainingTime / 1000) / 60);
            document.getElementById('cooldown-timer').innerText = `Next roleplay can be created in ${minutes} minutes.`;
        } else {
            document.getElementById('cooldown-timer').innerText = 'You can create a new roleplay now!';
        }
    }
}

// Call updateCooldownTimer and display roleplays on load
window.onload = function() {
    displayRoleplays();
    updateCooldownTimer();
};
