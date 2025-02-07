        // User Management
        let currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
        let users = JSON.parse(localStorage.getItem('users')) || []; // 
        let autoSlideInterval;

        // Check for token on page load
        window.addEventListener('load', () => {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token'); // Check both localStorage and sessionStorage
          const storedUser = localStorage.getItem('currentUser');
        
          if (token && storedUser) {
            currentUser = JSON.parse(storedUser);
            updateAuthUI();
          }
        });

        // Carousel Functionality
        const carouselSlides = document.querySelector('.carousel-slides');
        const slides = document.querySelectorAll('.carousel-slide');
        const dotsContainer = document.querySelector('.carousel-dots');
        let currentIndex = 0;

        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if(index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => showSlide(index));
            dotsContainer.appendChild(dot);
        });

        // Carousel controls
        function showSlide(index) {
            currentIndex = (index + slides.length) % slides.length;
            carouselSlides.style.transform = `translateX(-${currentIndex * 100}%)`;
            document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }

        function nextSlide() {
            showSlide(currentIndex + 1);
        }

        function prevSlide() {
            showSlide(currentIndex - 1);
        }

        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        carouselSlides.parentElement.addEventListener('mouseenter', stopAutoSlide);
        carouselSlides.parentElement.addEventListener('mouseleave', startAutoSlide);
        startAutoSlide();

        // Auth Logic
        const authModal = document.getElementById('authModal');
        const authBtn = document.getElementById('authBtn');
        const userStatus = document.querySelector('.user-status');

        // Update the Auth UI based on the current user
        function updateAuthUI() {
            if(currentUser) {
                userStatus.textContent = `Bienvenido, ${currentUser.email.split('@')[0]}`;
                userStatus.style.display = 'inline';
                authBtn.textContent = 'Cerrar Sesión';
            } else {
                userStatus.style.display = 'none';
                authBtn.textContent = 'Login';
            }
        }

        // Show error message
        function showError(formId, message) {
            const form = document.getElementById(formId);
            const errorElement = form.querySelector('.error-message');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        // Clear error messages
        function clearErrors() {
            document.querySelectorAll('.error-message').forEach(el => {
                el.style.display = 'none';
            });
        }

        // Improved fetch function with error handling
        async function fetchWithErrorHandling(url, options) {
          try {
            const response = await fetch(url, options);

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Request failed');
            }

            return await response.json();
          } catch (err) {
            console.error('Fetch error:', err);
            throw err;
          }
        }

        // Add a loading state
        function setLoading(formId, isLoading) {
          const form = document.getElementById(formId);
          const button = form.querySelector('button[type="submit"]');

          if (isLoading) {
            button.disabled = true;
            button.textContent = 'Loading...';
          } else {
            button.disabled = false;
            button.textContent = 'Submit';
          }
        }

        // Login Form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();
          
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe')?.checked;
          
            if (!validateEmail(email)) {
              showError('loginForm', 'Please enter a valid email address.');
              return;
            }
            
            try {
              const data = await fetchWithErrorHandling(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
              });
          
              if (rememberMe) {
                localStorage.setItem('token', data.token); // Store token in localStorage
              } else {
                sessionStorage.setItem('token', data.token); // Store token in sessionStorage
              }
          
              localStorage.setItem('currentUser', JSON.stringify({ email })); // Store the currentUser object
              currentUser = { email }; // Update current user
              updateAuthUI();
              closeModal();
            } catch (err) {
              showError('loginForm', err.message || 'An error occurred. Please try again.');
            }
          });

        // Signup Form
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();
          
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
          
            if (password.length < 6) {
              showError('signupForm', 'La contraseña debe tener al menos 6 caracteres');
              return;
            }
          
            try {
              const data = await fetchWithErrorHandling(`${BACKEND_URL}/auth/register`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
              });
          
              alert('Registro exitoso! Por favor inicia sesión');
              showLogin();
            } catch (err) {
              showError('signupForm', err.message || 'An error occurred. Please try again.');
            }
          });

        // Auth Modal Controls
        function openModal() {
            authModal.style.display = 'block';
        }

        function closeModal() {
            authModal.style.display = 'none';
            clearErrors();
        }

        function showSignup() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('signupForm').style.display = 'block';
        }

        function showLogin() {
            document.getElementById('signupForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        }

        // Check if the token is expired
        function isTokenExpired(token) {
          const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
          return payload.exp * 1000 < Date.now(); // Check if the token is expired
        }

        // Example: Check token expiration before making a request
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          if (token && isTokenExpired(token)) {
            logout(); // Log out the user if the token is expired
        }

        function logout() {
          const confirmLogout = confirm('Are you sure you want to log out?');
          if (confirmLogout) {
            localStorage.removeItem('token'); // Remove the JWT token
            sessionStorage.removeItem('token'); // Remove the session token
            localStorage.removeItem('currentUser'); // Remove the currentUser object
            localStorage.removeItem('users'); // Clear the users array (if used locally)
            currentUser = null; // Reset the currentUser variable
            updateAuthUI(); // Update the UI
          }
        }
        
        // Add password visibility toggle
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(`${inputId}-toggle`);

  if (input.type === 'password') {
    input.type = 'text';
    toggle.textContent = 'Hide';
  } else {
    input.type = 'password';
    toggle.textContent = 'Show';
  }
}

// Add to login form
document.getElementById('loginPassword-toggle').addEventListener('click', () => {
  togglePasswordVisibility('loginPassword');
});

// Add to signup form
document.getElementById('signupPassword-toggle').addEventListener('click', () => {
  togglePasswordVisibility('signupPassword');
});

        // Event Listeners
        authBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(currentUser) {
                logout();
            } else {
                openModal();
            }
        });

        window.onclick = (e) => {
            if(e.target === authModal) closeModal();
        }

        // Initialize
        updateAuthUI();
        document.querySelector('.carousel-next').addEventListener('click', nextSlide);
        document.querySelector('.carousel-prev').addEventListener('click', prevSlide);

        // Smooth scroll to contact
        function scrollToPlanes() {
            document.getElementById('planes').scrollIntoView({
                behavior: 'smooth'
            });
        }

        function scrollToContact() {
            document.getElementById('contacto').scrollIntoView({
                behavior: 'smooth'
            });
        }
        function scrollToInicio() {
           document.getElementById('inicio').scrollIntoView({
                behavior: 'smooth'
            });
        }
        function scrollToContenido() {
           document.getElementById('contenido').scrollIntoView({
                behavior: 'smooth'
            });
        }

const BACKEND_URL = 'https://medical-decks-backend.onrender.com';

// Test backend connection
fetch(`${BACKEND_URL}/api/health-check`)
  .then(response => response.json())
  .then(data => {
    console.log('Backend status:', data);
    document.getElementById('status').textContent = data.message; // Update UI
  })
  .catch(error => console.error('Connection failed:', error));