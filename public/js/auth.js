document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const logoutBtn = document.getElementById("logout");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const role = "user";

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role}),
            });

            const data = await res.json();
            if (res.ok) {
                document.cookie = `token=${data.token}; path=/`;
                window.location.href = "/profile";
            } else {
                alert(data.error);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (res.ok) {
                document.cookie = `token=${data.token}; path=/`;
                window.location.href = "/profile";
            } else {
                alert(data.error);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            window.location.href = "/login";
        });
    }

    if (window.location.pathname === "/profile") {
        const token = document.cookie.split("=")[1];
        if (!token) return (window.location.href = "/login");

        fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    window.location.href = "/login";
                } else {
                    document.getElementById("userName").innerText = data.name;
                }
            });
    }
});
