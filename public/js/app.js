// User Management
let currentUser;
try {
    currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
} catch (error) {
    console.error(error);
    localStorage.removeItem('currentUser');
}
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
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => showSlide(index));
    dotsContainer.appendChild(dot);
});

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
    if (currentUser) {
        userStatus.textContent = `Bienvenido, ${currentUser.email.split('@')[0]}`;
        userStatus.style.display = 'inline';
        authBtn.textContent = 'Cerrar Sesión';
    } else {
        userStatus.style.display = 'none';
        authBtn.textContent = 'Login';
    }
}

// Add password toggle listeners
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
      // Find the closest password container
      const container = this.closest('.password-container');
      // Get the input field within this container
      const input = container.querySelector('input');
      // Call toggle function
      togglePasswordVisibility(input);
    });
  });

  function togglePasswordVisibility(input) {
    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  }

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password Strength Meter
function checkPasswordStrength(password) {
    const strength = {
        score: 0,
        message: '',
    };

    if (password.length >= 8) strength.score++;
    if (/[A-Z]/.test(password)) strength.score++;
    if (/[0-9]/.test(password)) strength.score++;
    if (/[^A-Za-z0-9]/.test(password)) strength.score++;

    switch (strength.score) {
        case 0:
        case 1:
            strength.message = 'Weak';
            break;
        case 2:
            strength.message = 'Moderate';
            break;
        case 3:
            strength.message = 'Strong';
            break;
        case 4:
            strength.message = 'Very Strong';
            break;
    }

    return strength;
}

document.getElementById('signupPassword').addEventListener('input', (e) => {
    const password = e.target.value;
    const strength = checkPasswordStrength(password);
    const strengthMeter = document.getElementById('password-strength');
    if (strengthMeter) {
        strengthMeter.textContent = `Password Strength: ${strength.message}`;
    }
});

// Show Loading State
function setLoadingState(formId, isLoading) {
    const form = document.getElementById(formId);
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? 'Cargando...' : (formId === 'loginForm' ? 'Iniciar Sesión' : 'Registrarse');
}

// Show Error Messages
function showError(formId, message) {
    const form = document.getElementById(formId);
    const errorElement = form.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Clear Errors
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
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validate Email
    if (!isValidEmail(email)) {
        showError('loginForm', 'Por favor, introduce un correo electrónico válido.');
        return;
    }

    // Show Loading State
    setLoadingState('loginForm', true);

    try {
        console.log('Sending login request...');
        const payload = { email, password };
        console.log('Payload:', payload);

        const response = await fetch(`/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log('Response received:', response);

        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
            currentUser = data.user;
            if (currentUser){
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            else {
                localStorage.removeItem('currentUser');
            }

            // Remember Me Functionality
            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify(currentUser));
            } else {
                localStorage.removeItem('rememberedUser');
            }

            closeModal();
            updateAuthUI();
            window.location.href = '/dashboard/'; // Redirect to /dashboard (without trailing slash)
        } else {
            showError('loginForm', data.error || 'Credenciales incorrectas.');
        }
    } catch (error) {
        console.error('Login failed:', error);
        showError('loginForm', 'Error de conexión. Inténtalo de nuevo.');
    } finally {
        setLoadingState('loginForm', false);
    }
});

// Signup Form
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate Email
    if (!isValidEmail(email)) {
        showError('signupForm', 'Por favor, introduce un correo electrónico válido.');
        return;
    }

    // Validate Password
    if (password.length < 6) {
        showError('signupForm', 'La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    // Confirm Password
    if (password !== confirmPassword) {
        showError('signupForm', 'Las contraseñas no coinciden.');
        return;
    }

    // Show Loading State
    setLoadingState('signupForm', true);

    try {
        console.log('Sending registration request...');
        const payload = { email, password };
        console.log('Payload:', payload);

        const response = await fetch(`${BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log('Response received:', response);

        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
            alert('Registro exitoso! Por favor inicia sesión.');
            showLogin();
        } else {
            showError('signupForm', data.error || 'Error en el registro.');
        }
    } catch (error) {
        console.error('Registration failed:', error);
        showError('signupForm', 'Error de conexión. Inténtalo de nuevo.');
    } finally {
        setLoadingState('signupForm', false);
    }
});

// Remember Me on Page Load
window.addEventListener('load', () => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        currentUser = JSON.parse(rememberedUser);
        updateAuthUI();
    }
});

// Session Expiry
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logout, 30 * 60 * 1000); // 30 minutes
}

window.addEventListener('mousemove', resetInactivityTimer);
window.addEventListener('keypress', resetInactivityTimer);

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    alert('You have been logged out due to inactivity.');
}

// Auth Modal Controls
function openModal() {
    authModal.style.display = 'block';
}

function closeModal() {
    authModal.style.display = 'none';
    clearErrors();
}

function showSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
  }
  
  function showLogin() {
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
  }

// Event Listeners
authBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser) {
        logout();
    } else {
        openModal();
    }
});

window.onclick = (e) => {
    if (e.target === authModal) closeModal();
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

document.getElementById('inicioBtn').addEventListener('click', scrollToInicio);
document.getElementById('contenidoBtn').addEventListener('click', scrollToContenido);
document.getElementById('planesBtn').addEventListener('click', scrollToPlanes);
document.getElementById('contactoBtn').addEventListener('click', scrollToContact);

function handleRegistration() {
    console.log('Registration initiated');
  }

document.getElementById('signupLink').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default link behavior
    showSignup(); // Call your existing function
  });
   
// Add close button listener
document.querySelector('.close-btn').addEventListener('click', closeModal);

// Add login link listener
document.getElementById('loginLink').addEventListener('click', function(e) {
    e.preventDefault();
    showLogin();
  });

const BACKEND_URL = 'https://medical-decks-backend.onrender.com';

// Test backend connection
fetch(`${BACKEND_URL}/api/health-check`)
    .then(response => response.json())
    .then(data => {
        console.log('Backend status:', data);
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = data.message; // Update UI
        }
    })
    .catch(error => console.error('Connection failed:', error));