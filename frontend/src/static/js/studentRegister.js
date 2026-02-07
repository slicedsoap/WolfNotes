const form = document.querySelector('form');
form.addEventListener("submit", validateStudentRegisterForm);

/**
 * Frontend custom validation for the student registration form.
 */
function validateStudentRegisterForm(event) {
    const form = event.target;
    event.preventDefault(); // prevent normal submit

    // grab all form elements
    const firstName = form.firstName;
    const lastName = form.lastName;
    const email = form.email;
    const institution = form.institution;
    const password = form.password;
    const passwordVerification = form.passwordVerification;

    // reset validity
    firstName.setCustomValidity("");
    lastName.setCustomValidity("");
    email.setCustomValidity("");
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

    // validate password
    if (!password.value.trim()) {
        password.setCustomValidity("Password is required.");
    } else if (password.value.length < 8) {
        password.setCustomValidity("Password must be at least 8 characters long.");
    }

    // validate password confirmation
    if (!passwordVerification.value.trim()) {
        passwordVerification.setCustomValidity("Password confirmation is required.");
    } else if (password.value !== passwordVerification.value) {
        passwordVerification.setCustomValidity("Passwords do not match.");
    }

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // send form data as json
    const data = {
        role: "student",
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        email: email.value.trim(),
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
            window.location.href = "/student/home"; 
        } else {
            alert(data.message || "Registration failed.");
        }
    })
    .catch(err => {
        console.error("Error submitting registration:", err);
        alert("An error occurred. Please try again.");
    });
}
