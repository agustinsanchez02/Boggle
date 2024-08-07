'use strict';

var nameInput = document.getElementById('name');
var emailInput = document.getElementById('email');
var messageInput = document.getElementById('message');
var form = document.getElementById('contactForm');

var nameError = document.getElementById('nameError');
var emailError = document.getElementById('emailError');
var messageError = document.getElementById('messageError');

var confirmationModal = document.getElementById('confirmationModal');
var messagePreview = document.getElementById('messagePreview');
var confirmSendButton = document.getElementById('confirmSend');
var cancelSendButton = document.getElementById('cancelSend');
var successMessage = document.getElementById('successMessage');

// Llena los campos del formulario con los datos guardados en el localStorage.
window.onload = function() {
    var userData = localStorage.getItem('userData');
    if (userData) {
        userData = JSON.parse(userData);
        nameInput.value = userData.name;
        emailInput.value = userData.email;
    }
    messageInput.value = '';
};

// Función para mostrar errores
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

// Función para limpiar errores
function clearError(element) {
    element.textContent = '';
    element.style.display = 'none';
}

// Validación del Nombre.
function checkName() {
    var name = nameInput.value.trim();
    clearError(nameError);
    if (name === '') {
        showError(nameError, 'El campo del Nombre no puede estar vacío.');
        return false;
    }
    var regex = /^[a-zA-Z\s]{6,}$/;
    if (!regex.test(name)) {
        showError(nameError, 'El campo del Nombre debe tener al menos 6 caracteres sin números.');
        return false;
    }
    if (name.indexOf(' ') === -1) {
        showError(nameError, 'El campo del Nombre debe tener al menos un espacio.');
        return false;
    }
    return true;
}

// Validación del Email.
function checkEmail() {
    var email = emailInput.value.trim();
    clearError(emailError);
    if (email === '') {
        showError(emailError, 'El campo del Email no puede estar vacío.');
        return false;
    }
    var regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!regex.test(email)) {
        showError(emailError, 'El campo del Email no tiene un formato válido.');
        return false;
    }
    return true;
}

// Validación del Mensaje.
function checkMessage() {
    var message = messageInput.value.trim();
    clearError(messageError);
    if (message === '') {
        showError(messageError, 'El campo del Mensaje no puede estar vacío.');
        return false;
    }
    if (message.length < 5) {
        showError(messageError, 'El campo del Mensaje debe tener al menos 5 caracteres.');
        return false;
    }
    return true;
}

// Validación del Formulario.
form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    var isNameValid = checkName();
    var isEmailValid = checkEmail();
    var isMessageValid = checkMessage();
    
    if (isNameValid && isEmailValid && isMessageValid) {
        var userData = {
            name: nameInput.value,
            email: emailInput.value,
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        messagePreview.textContent = messageInput.value;
        confirmationModal.style.display = 'block';
    }
});

confirmSendButton.addEventListener('click', function() {
    var mailtoLink = 'mailto:agusjcr2016@gmail.com' +
        '?subject=Consulta Boogle' +
        '&body=' + encodeURIComponent(messageInput.value) +
        '&cc=' + encodeURIComponent(emailInput.value);
    
    window.location.href = mailtoLink;
    
    confirmationModal.style.display = 'none';
    successMessage.textContent = 'Mensaje enviado con éxito.';
    successMessage.style.display = 'block';
    messageInput.value = '';
    
    setTimeout(function() {
        successMessage.style.display = 'none';
    }, 3000);
});

cancelSendButton.addEventListener('click', function() {
    confirmationModal.style.display = 'none';
});

// Validación en tiempo real
nameInput.addEventListener('blur', checkName);
emailInput.addEventListener('blur', checkEmail);
messageInput.addEventListener('blur', checkMessage);

// Limpieza de campos al enfocar
nameInput.addEventListener('focus', function() {
    clearError(nameError);
});

emailInput.addEventListener('focus', function() {
    clearError(emailError);
});

messageInput.addEventListener('focus', function() {
    clearError(messageError);
});