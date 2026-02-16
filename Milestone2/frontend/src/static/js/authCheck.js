/**
 * Frontend verification that a user is visiting a page they can access.
 * Supports offline access if the user logged in before.
 */
async function checkUserRole(expectedRole) {
    // if offline, check cache immediately
    if (!navigator.onLine) {
        const cachedRole = localStorage.getItem("userRole");
        if (!cachedRole) {
            window.location.href = "/login";
            return;
        }
        if (cachedRole !== expectedRole) {
            redirectBasedOnRole(cachedRole);
        }
        return;
    }
    
    // Online - try API call
    try {
        const response = await fetch("/api/auth/verify", {
            method: "GET",
            credentials: "include"
        });
        
        if (!response.ok) {
            const cachedRole = localStorage.getItem("userRole");
            if (cachedRole && cachedRole === expectedRole) {
                return;
            }
            window.location.href = "/login";
            return;
        }
        
        const data = await response.json();
        const userRole = data.user?.role;
        localStorage.setItem("userRole", userRole);
        
        if (userRole !== expectedRole) {
            redirectBasedOnRole(userRole);
        }
    } catch (err) {
        const cachedRole = localStorage.getItem("userRole");
        if (!cachedRole || cachedRole !== expectedRole) {
            window.location.href = "/login";
            return;
        }
    }
}

function redirectBasedOnRole(role) {
    if (role === "student") {
        window.location.href = "/student/home";
    } else if (role === "instructor") {
        window.location.href = "/instructor/home";
    } else {
        window.location.href = "/login";
    }
}