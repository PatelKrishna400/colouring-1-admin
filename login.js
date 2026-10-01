import { auth, provider } from './firebase-config.js';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const btnGoogle = document.getElementById('btn-google');
const btnLoginEmail = document.getElementById('btn-login-email');
const btnRegister = document.getElementById('btn-register');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const statusMessage = document.getElementById('status-message');

// Check if there is a redirect parameter
const urlParams = new URLSearchParams(window.location.search);
const redirectTarget = urlParams.get('redirect') || 'index.html';

btnGoogle.addEventListener('click', () => {
  signInWithPopup(auth, provider).catch(err => {
    statusMessage.style.color = 'red';
    statusMessage.innerText = err.message;
  });
});

btnLoginEmail.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  if (!email || !password) {
    statusMessage.style.color = 'red';
    statusMessage.innerText = 'Please enter both email and password.';
    return;
  }
  
  btnLoginEmail.disabled = true;
  btnLoginEmail.innerText = 'Logging in...';

  signInWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      statusMessage.style.color = 'red';
      statusMessage.innerText = error.message;
    })
    .finally(() => {
      btnLoginEmail.disabled = false;
      btnLoginEmail.innerText = 'Login';
    });
});

btnRegister.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  if (!email || !password) {
    statusMessage.style.color = 'red';
    statusMessage.innerText = 'Please enter both email and password.';
    return;
  }
  
  btnRegister.disabled = true;
  btnRegister.innerText = 'Registering...';

  createUserWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      statusMessage.style.color = 'red';
      statusMessage.innerText = error.message;
    })
    .finally(() => {
      btnRegister.disabled = false;
      btnRegister.innerText = 'Register';
    });
});

// Redirect when authenticated
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = redirectTarget;
  }
});
