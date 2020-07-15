/* AUTH RELATED FUNCTIONALITIES */

auth.onAuthStateChanged((user) => {
    if (user) {
        setupUI(user);
    } else {
        setupUI();
    }
});

// login
const loginForm = document.querySelector("#login-form");
if (loginForm != null) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // get user info
        const email = loginForm["login-email"].value;
        const password = loginForm["login-password"].value;

        // log the user in
        auth.signInWithEmailAndPassword(email, password)
            .then((cred) => {
                window.location = "./premium.html";
            })
            .catch((err) => {
                loginForm.querySelector(".error").innerHTML = err.message;
            });
    });
}

// logout
const logout = document.querySelector(".logout-fx");
if (logout != null) {
    logout.addEventListener("click", (e) => {
        e.preventDefault();
        auth.signOut()
            .then(() => {
                window.location = "./";
            })
            .catch((err) => {
                M.toast({ html: "check console" });
                console.log(err.message);
            });
    });
}
