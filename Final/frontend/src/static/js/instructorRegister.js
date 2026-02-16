const form = document.querySelector('form');
form.addEventListener("submit", validateInstructorRegisterForm);

/**
 * Frontend custom validation for the instructor registration form.
 * Validates required registration fields using setCustomValidity and prevents submission until valid.
 * @param {*} event - form submission event
 */
function validateInstructorRegisterForm(event) {
    const form = event.target;
    event.preventDefault(); // always prevent default for custom validation

    // grab all form elements
    const firstName = form.firstName;
    const lastName = form.lastName;
    const email = form.email;
    const subject = form.subject;
    const institution = form.institution;
    const password = form.password;
    const passwordVerification = form.passwordVerification;

    // reset previous validity states
    firstName.setCustomValidity("");
    lastName.setCustomValidity("");
    email.setCustomValidity("");
    subject.setCustomValidity("");
    institution.setCustomValidity("");
    password.setCustomValidity("");
    passwordVerification.setCustomValidity("");

    // validate first name
    if (!firstName.value.trim()) {
        firstName.setCustomValidity("First name is required.");
    }

    // validate last name
    if (!lastName.value.trim()) {
        lastName.setCustomValidity("Last name is required.");
    }

    // validate email
    if (!email.value.trim()) {
        email.setCustomValidity("Email is required.");
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            email.setCustomValidity("Invalid email format.");
        }
    }

    // validate subject
    if (!subject.value.trim()) {
        subject.setCustomValidity("Subject is required.");
    }

    // validate institution
    if (!institution.value.trim()) {
        institution.setCustomValidity("Institution is required.");
    }

    // validate password
    if (!password.value.trim()) {
        password.setCustomValidity("Password is required.");
    } else if (password.value.length < 8) {
        password.setCustomValidity("Password must be at least 8 characters long.");
    }

    // validate password verification
    if (!passwordVerification.value.trim()) {
        passwordVerification.setCustomValidity("Password confirmation is required.");
    } else if (password.value !== passwordVerification.value) {
        passwordVerification.setCustomValidity("Passwords do not match.");
    }

    // check overall form validity before submitting
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // send form data as JSON
    const data = {
        role: "instructor",
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        email: email.value.trim(),
        subject: subject.value.trim(),
        institution: institution.value.trim(),
        password: password.value.trim(),
    };

    fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = "/instructor/home"; 
        } else {
            alert(data.message || "Registration failed.");
        }
    })
    .catch(err => {
        console.error("Error submitting registration:", err);
        alert("An error occurred. Please try again.");
    });
}