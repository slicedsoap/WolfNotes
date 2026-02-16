
const form = document.querySelector('form');

form.addEventListener("submit", validateLoginForm);

/**
 * Frontend custom validation for the login form.
 * Validates required login fields using setCustomValidity and prevents submission until valid.
 * @param {*} event - form submission event
 */
function validateLoginForm(event) {
    console.log("Login form validation started");
    
    const form = event.target;
    event.preventDefault(); // always prevent default for custom validation

    // grab all form elements
    const email = form.email;
    const password = form.password;

    // reset previous validity states
    email.setCustomValidity("");
    password.setCustomValidity("");

    // validate email field
    if (!email.value || email.value.trim() === "") {
        email.setCustomValidity("Email is required.");
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // basic email format
        if (!emailRegex.test(email.value.trim())) {
        email.setCustomValidity("Invalid email format.");
        }
    }

    // validate password field
    if (!password.value || password.value.trim() === "") {
        password.setCustomValidity("Password is required.");
    }

    // check overall form validity before submitting
    if (!form.checkValidity()) {
        form.reportValidity();
    } else {
        form.submit(); // submit manually if valid
    }
}
