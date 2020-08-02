const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");

const setupUI = (user) => {
    if (user) {
        // toggle user UI elements
        loggedInLinks.forEach((item) => (item.style.display = "block"));
        loggedOutLinks.forEach((item) => (item.style.display = "none"));
    } else {
        // toggle user elements
        loggedInLinks.forEach((item) => (item.style.display = "none"));
        loggedOutLinks.forEach((item) => (item.style.display = "block"));
    }
};

auth.onAuthStateChanged((user) => {
    if (user && JSON.parse(sessionStorage.getItem("uims-auth"))) {
        setupUI(user);
    } else {
        setupUI();
    }
});

// login with UIMS
const formLoginWithUIMS = document.querySelector("#login-with-uims-form");
if (formLoginWithUIMS != null) {
    formLoginWithUIMS.addEventListener("submit", (e) => {
        e.preventDefault();

        $("#modal-login-with-uims .form-submit-button").hide();
        $("#modal-login-with-uims .error").hide();
        $("#modal-login-with-uims .progress").show();

        // log the user in
        firebase
            .auth()
            .signInAnonymously()
            .then((user) => {
                // Request attendance
                var fetchAttendance = firebase
                    .functions()
                    .httpsCallable("fetchAttendanceV2");

                fetchAttendance({
                    uid: formLoginWithUIMS["login-with-uims-username"].value,
                    pass: formLoginWithUIMS["login-with-uims-password"].value,
                }).then((result) => {
                    if (result.data.desc === "error") {
                        $("#modal-login-with-uims .error").text(
                            result.data.error
                        );
                        $("#modal-login-with-uims .error").show();
                        $("#modal-login-with-uims .progress").hide();
                        $("#modal-login-with-uims .form-submit-button").show();
                        auth.signOut().catch((err) => {
                            console.log(err.message);
                        });
                    } else {
                        sessionStorage.setItem("uims-auth", true);
                        setupUI(user);
                        $("#modal-login-with-uims .error").text("success");
                        $("#modal-login-with-uims .error").show();
                        $("#modal-login-with-uims .progress").hide();
                        sessionStorage.setItem(
                            "attendanceData",
                            JSON.stringify(result.data)
                        );
                        window.location = "./demo.html";
                    }
                });
            })
            .catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode);
                console.log(errorMessage);
            });
    });
}

// logout
const logoutTrigger = document.querySelector(".logout-fx");
if (logoutTrigger != null) {
    logoutTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        auth.signOut()
            .then(() => {
                sessionStorage.setItem("uims-auth", false);
                sessionStorage.removeItem("attendanceData");
                if ($(".modal")) {
                    $(".modal").modal();
                }
                if (window.location.href.search(/.*\/demo\.html/i) < 0)
                    window.location = "./index.html";
            })
            .catch((err) => {
                M.toast({ html: "check console" });
                console.log(err.message);
            });
    });
}
