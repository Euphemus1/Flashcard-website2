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

// Pricing Configuration
const PRICING = {
    basic: {
        brl: [80, 70, 60, 50],
        ars: [14000, 12500, 10800, 9000]
    },
    premium: {
        brl: [120, 110, 100, 90],
        ars: [22000, 20000, 18000, 16000]
    }
};

// Initialize prices on page load
document.querySelectorAll('.plan-card').forEach(planCard => {
    const activeDurationBtn = planCard.querySelector('.duration-btn.active');
    const durationIndex = Array.from(activeDurationBtn.parentElement.children)
        .indexOf(activeDurationBtn);
    const priceElement = planCard.querySelector('.price-value');
    const priceContainer = priceElement.closest('.price-container');
    const isPremium = planCard.classList.contains('premium');
    const prices = isPremium ? PRICING.premium : PRICING.basic;
    
    // Set ARS by default
    const globalCurrency = document.querySelector('.global-currency-toggle .toggle-option.active').dataset.currency;
    priceContainer.setAttribute('data-currency', globalCurrency);
    const priceValue = prices[globalCurrency.toLowerCase()][durationIndex];
    
    const formatted = priceValue.toLocaleString('es-AR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const [main, decimals] = formatted.split(',');
    priceElement.innerHTML = `${main}<span class="decimal-part">,${decimals}</span>`;
});

// Currency Toggle Handler
document.querySelectorAll('.global-currency-toggle .toggle-option').forEach(button => {
    button.addEventListener('click', function() {
        const container = this.closest('.toggle-container');
        const currency = this.dataset.currency;
        const slider = container.querySelector('.slider');
        
        // Update active currency
        container.querySelectorAll('.toggle-option').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');

        // Update all plan cards
        document.querySelectorAll('.plan-card').forEach(planCard => {
            const priceContainer = planCard.querySelector('.price-container');
            priceContainer.setAttribute('data-currency', currency);

            // Get active duration
            const activeDurationBtn = planCard.querySelector('.duration-btn.active');
            const durationIndex = Array.from(activeDurationBtn.parentElement.children)
                .indexOf(activeDurationBtn);

            // Update price
            const priceElement = planCard.querySelector('.price-value');
            const isPremium = planCard.classList.contains('premium');
            const prices = isPremium ? PRICING.premium : PRICING.basic;
            const newPrice = prices[currency.toLowerCase()][durationIndex];
            
            const formatted = newPrice.toLocaleString('es-AR', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            const [main, decimals] = formatted.split(',');
            priceElement.innerHTML = `${main}<span class="decimal-part">,${decimals}</span>`;
        });

        // Update slider
        slider.style.transform = currency === 'BRL' ? 'translateX(100%)' : 'translateX(0)';
            getComputedStyle(document.documentElement).getPropertyValue('--secondary-color');
    });
});

// Update duration selection handler
document.querySelectorAll('.duration-btn').forEach(button => {
    button.addEventListener('click', function() {
        const planCard = this.closest('.plan-card');
        const durationSelector = this.closest('.duration-selector');
        
        // Remove active class from all buttons in this duration selector
        durationSelector.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // REST OF THE CODE TO REPLACE STARTS HERE
        const durationIndex = Array.from(durationSelector.children)
            .indexOf(this);
            const currency = document.querySelector('.global-currency-toggle .toggle-option.active').dataset.currency;
            const isPremium = planCard.classList.contains('premium');
        
        // Update price - REPLACE THIS PART
        const priceElement = planCard.querySelector('.price-value');
        const prices = isPremium ? PRICING.premium : PRICING.basic;
        const newPrice = prices[currency.toLowerCase()][durationIndex];
        
        // NEW CODE TO PASTE:
        const formatted = newPrice.toLocaleString('es-AR', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        const [main, decimals] = formatted.split(',');
        priceElement.innerHTML = `${main}<span class="decimal-part">,${decimals}</span>`;
        // END OF REPLACEMENT
    });
});

// Plan Selection
document.querySelectorAll('.plan-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!currentUser) {
            openModal();
            return;
        }
        
        const planCard = e.target.closest('.plan-card');
        const currency = document.querySelector('.toggle-option.active').dataset.currency;
        const duration = planCard.querySelector('.duration-btn.active').dataset.months;
        const price = parseFloat(planCard.querySelector('.price-value').textContent.replace(',', '.'));
        const planType = planCard.classList.contains('premium') ? 'premium' : 'basic';

        try {
            const response = await fetch(`${BACKEND_URL}/api/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    plan: planType,
                    duration: parseInt(duration),
                    currency: currency,
                    price: price
                })
            });

            if (response.ok) {
                window.location.href = '/payment';
            } else {
                alert('Erro ao processar assinatura');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Erro de conexão');
        }
    });
});



// Scroll-triggered animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Apply to all flashcards
document.querySelectorAll('.card-pair').forEach((card) => {
    observer.observe(card);
});

// Add flip functionality to Revisar button
document.querySelectorAll('.revisar-btn').forEach(button => {
    button.addEventListener('click', function() {
        const cardPair = this.closest('.card-pair');
        const flipCard = cardPair.querySelector('.flip-card');
        cardPair.classList.add('flipped');
        flipCard.classList.add('flipped');
    });
});

// Choice Flashcard Logic
function initializeChoiceFlashcards() {
    // Choice click handler
    function handleChoiceClick() {
        const cardPair = this.closest('.card-pair');
        const cardContent = this.closest('.card-content');
        const srsControls = cardPair.querySelector('.srs-controls');
        
        if (this.dataset.correct === 'true') {
            // Show explanation
            const explanation = this.dataset.explanation;
            const explanationContainer = cardContent.querySelector('.explanation-container');
            
            // Hide other options
            cardContent.querySelectorAll('.choice').forEach(btn => {
                if (btn !== this) btn.classList.add('hidden-option');
                btn.disabled = true;
            });

            // Show SRS controls
            srsControls.classList.add('visible');

            // Show explanation
            explanationContainer.innerHTML = `<div class="explanation-text">${explanation}</div>`;
            explanationContainer.classList.add('visible');
            this.classList.add('correct');
        } else {
            this.classList.add('wrong');
            this.disabled = true;
        }
    }

    // SRS button handler
    function handleSrsClick() {
        const cardPair = this.closest('.card-pair');
        const successMessage = cardPair.querySelector('.success-message');

        // Show success message
        successMessage.style.display = 'flex';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            successMessage.style.opacity = '0';
        }, 5000);

        // Full reset after 15 seconds
        setTimeout(() => {
            // Reset choices
            cardPair.querySelectorAll('.choice').forEach(btn => {
                btn.classList.remove('correct', 'wrong', 'hidden-option');
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.visibility = 'visible';
                btn.style.transform = 'scale(1)';
            });

            // Reset explanation
            const explanationContainer = cardPair.querySelector('.explanation-container');
            explanationContainer.classList.remove('visible');
            explanationContainer.innerHTML = '';
            explanationContainer.style.maxHeight = '0';

            // Reset SRS controls
            const srsControls = cardPair.querySelector('.srs-controls');
            srsControls.classList.remove('visible');

            // Reset success message
            successMessage.style.display = 'none';
            successMessage.style.opacity = '1';

            // Re-attach event listeners
            cardPair.querySelectorAll('.choice').forEach(choice => {
                choice.addEventListener('click', handleChoiceClick);
            });
        }, 5000);
    }

    // Initialize all choice flashcards
    document.querySelectorAll('.choice').forEach(choice => {
        choice.addEventListener('click', handleChoiceClick);
    });

    // Initialize SRS buttons
    document.querySelectorAll('.srs-controls .difficulty').forEach(button => {
        button.addEventListener('click', handleSrsClick);
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeChoiceFlashcards();
});

// ================================================================= //

// Update classic flashcard SRS handler for loop
document.querySelectorAll('.card-pair:not(.choice-card) .srs-controls .difficulty').forEach(button => {
    button.addEventListener('click', function() {
        const cardPair = this.closest('.card-pair');
        const successMessage = cardPair.querySelector('.success-message');
        const flipCard = cardPair.querySelector('.flip-card');

        // Show success message
        successMessage.style.display = 'flex';
        
        // Hide message after 2.5 seconds
        setTimeout(() => {
            successMessage.style.opacity = '0';
        }, 2500);

        // Full reset after 3 seconds
        setTimeout(() => {
            // Reset card state
            cardPair.classList.remove('flipped');
            flipCard.classList.remove('flipped');
            
            // Reset success message
            successMessage.style.display = 'none';
            successMessage.style.opacity = '1';
            
            // Reset animation properties
            successMessage.style.removeProperty('display');
            successMessage.style.removeProperty('opacity');
            
            // Re-enable revisar button
            const revisarBtn = cardPair.querySelector('.revisar-btn');
            revisarBtn.disabled = false;
            revisarBtn.style.opacity = '1';
            revisarBtn.style.cursor = 'pointer';
            
            // Re-attach flip functionality
            revisarBtn.addEventListener('click', handleRevisarClick);
        }, 3000);
    });
});

// Modified revisar button handler
let activeTimer; // Track active timer

function handleRevisarClick() {
    const cardPair = this.closest('.card-pair');
    const flipCard = cardPair.querySelector('.flip-card');
    
    // Clear any existing timers
    if (activeTimer) clearTimeout(activeTimer);
    
    // Disable button during interaction
    this.disabled = true;
    this.style.opacity = '0.5';
    this.style.cursor = 'not-allowed';
    
    cardPair.classList.add('flipped');
    flipCard.classList.add('flipped');
}

// Update initialization
document.querySelectorAll('.revisar-btn').forEach(button => {
    button.addEventListener('click', handleRevisarClick);
});