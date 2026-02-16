const form = document.querySelector('form');
form.addEventListener("submit", validateStudentRegisterForm);

/**
 * Frontend custom validation for the student registration form.
 * Validates required registration fields using setCustomValidity and prevents submission until valid.
 * @param {*} event - form submission event
 */
function validateStudentRegisterForm(event) {
    const form = event.target;
    event.preventDefault(); // always prevent default for custom validation

    // grab all form elements
    const name = form.name;
    const email = form.email;
    const institution = form.institution;
    const password = form.password;
    const passwordVerification = form.passwordVerification;

    // reset previous validity states
    name.setCustomValidity("");
    email.setCustomValidity("");
    institution.setCustomValidity("");
    password.setCustomValidity("");
    passwordVerification.setCustomValidity("");

    // validate name field
    if (!name.value || name.value.trim() === "") {
        name.setCustomValidity("Full name is required.");
    }

    // validate email field
    if (!email.value || email.value.trim() === "") {
        email.setCustomValidity("Email is required.");
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // basic email format
        if (!emailRegex.test(email.value.trim())) {
            email.setCustomValidity("Invalid email format.");
        }
    }

    // institution field is optional, no validation needed

    // validate password field
    if (!password.value || password.value.trim() === "") {
        password.setCustomValidity("Password is required.");
    } else if (password.value.length < 8) {
        password.setCustomValidity("Password must be at least 8 characters long.");
    }

    // validate password verification field
    if (!passwordVerification.value || passwordVerification.value.trim() === "") {
        passwordVerification.setCustomValidity("Password confirmation is required.");
    } else if (password.value !== passwordVerification.value) {
        passwordVerification.setCustomValidity("Passwords do not match.");
    }

    // check overall form validity before submitting
    if (!form.checkValidity()) {
        form.reportValidity();
    } else {
        form.submit(); // submit manually if valid
    }
}