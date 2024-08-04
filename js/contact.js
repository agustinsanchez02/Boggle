'use strict';

function initializeContactForm() {
    var form = document.getElementById('contactForm');
    form.addEventListener('submit', handleSubmit);
}

function handleSubmit(event) {
    event.preventDefault();
    
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var message = document.getElementById('message').value;
    
    if (!isValidName(name) || !isValidEmail(email) || !isValidMessage(message)) {
        alert('Por favor, completa todos los campos correctamente.');
        return;
    }
    
    var mailtoLink = 'agusjcr2016@gmail.com' +
        '?subject=' + encodeURIComponent('Contacto desde Boogle') +
        '&body=' + encodeURIComponent('Nombre: ' + name + '\nEmail: ' + email + '\n\nMensaje:\n' + message);
    
    window.location.href = mailtoLink;
}

function isValidName(name) {
    return name.length >= 3 && /^[a-zA-Z0-9\s]+$/.test(name);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidMessage(message) {
    return message.length > 5;
}

window.addEventListener('load', initializeContactForm);