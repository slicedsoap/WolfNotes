const form = document.querySelector("form");

const welcomePage = document.getElementById("welcomePageBtn");

welcomePage.addEventListener("click", (e) => {
  window.location.href = "/";
  return;
});

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
    return;
  }

  fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.value.trim(),
      password: password.value.trim(),
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        alert(data.message || "Invalid email or password.");
        return;
      }

      // redirect conditionally
      if (data.user.role === "student") {
        window.location.href = "/student/home";
      } else if (data.user.role === "instructor") {
        window.location.href = "/instructor/home";
      } else {
        alert("Unknown user role. Cannot continue.");
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
    });
}
