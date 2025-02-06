        // User Management
        let currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
        let users = JSON.parse(localStorage.getItem('users')) || []; // 
        let autoSlideInterval;

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

        function showError(formId, message) {
            const form = document.getElementById(formId);
            const errorElement = form.querySelector('.error-message');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        function clearErrors() {
            document.querySelectorAll('.error-message').forEach(el => {
                el.style.display = 'none';
            });
        }

        // Login Form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();
          
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
          
            try {
              const response = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
              });
          
              const data = await response.json();
          
              if (response.ok) {
                localStorage.setItem('token', data.token); // Store the JWT token
                localStorage.setItem('currentUser', JSON.stringify({ email })); // Store the currentUser object
                currentUser = { email }; // Update current user
                updateAuthUI();
                closeModal();
              } else {
                showError('loginForm', data.error || 'Invalid credentials');
              }
            } catch (err) {
              showError('loginForm', 'An error occurred. Please try again.');
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
              const response = await fetch(`${BACKEND_URL}/auth/register`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
              });
          
              const data = await response.json();
          
              if (response.ok) {
                alert('Registro exitoso! Por favor inicia sesión');
                showLogin();
              } else {
                showError('signupForm', data.error || 'Registration failed');
              }
            } catch (err) {
              showError('signupForm', 'An error occurred. Please try again.');
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

        function logout() {
            localStorage.removeItem('token'); // Remove the JWT token
            localStorage.removeItem('currentUser'); // Remove the currentUser object
            currentUser = null; // Reset the currentUser variable
            updateAuthUI(); // Update the UI
          }
        
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