// Profile dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initial initialization attempt
    initProfileDropdown();
    
    // Try again after a short delay to ensure all DOM elements are loaded
    setTimeout(initProfileDropdown, 500);
});

// Initialize the profile dropdown - can be called from any page
function initProfileDropdown() {
    try {
        const profileToggle = document.getElementById('profile-toggle');
        const profileDropdown = document.querySelector('.profile-dropdown-content');
        
        if (!profileToggle || !profileDropdown) {
            console.warn("Profile dropdown elements not found, will retry later");
            return;
        }
        
        // Remove previous event listeners if any (to prevent duplicates)
        const newProfileToggle = profileToggle.cloneNode(true);
        profileToggle.parentNode.replaceChild(newProfileToggle, profileToggle);
        
        // Add click event to the new toggle
        newProfileToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Profile icon clicked");
            
            // Toggle the dropdown visibility
            if (profileDropdown.classList.contains('show')) {
                profileDropdown.classList.remove('show');
                profileDropdown.style.display = 'none';
            } else {
                profileDropdown.classList.add('show');
                profileDropdown.style.display = 'block';
            }
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener('click', function(e) {
            if (profileDropdown.classList.contains('show') && 
                !newProfileToggle.contains(e.target) && 
                !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('show');
                profileDropdown.style.display = 'none';
            }
        });
        
        // Handle profile button click
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', function() {
                // This is left non-functional as per requirements
                profileDropdown.classList.remove('show');
                profileDropdown.style.display = 'none';
            });
        }
        
        // Ensure the logout button is properly styled
        const logoutBtn = document.getElementById('logout');
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            logoutBtn.style.visibility = 'visible';
            logoutBtn.style.opacity = '1';
            logoutBtn.style.color = '#34495e';
            logoutBtn.style.backgroundColor = 'transparent';
            
            // Add an explicit click handler to ensure it's visible when clicked
            logoutBtn.addEventListener('mousedown', function() {
                console.log("Logout button clicked");
            });
        }
        
        console.log("Profile dropdown successfully initialized");
    } catch (error) {
        console.error("Error initializing profile dropdown:", error);
    }
} 