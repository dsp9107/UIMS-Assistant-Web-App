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
    if (user) {
        setupUI(user);
    } else {
        setupUI();
    }
});

// login with UA
const formLoginWithUA = document.querySelector("#login-with-ua-form");
if (formLoginWithUA != null) {
    formLoginWithUA.addEventListener("submit", (e) => {
        e.preventDefault();

        var response = grecaptcha.getResponse();
        if (response.length == 0) {
            $("#modal-login-with-ua .error").text("captcha required");
            $("#modal-login-with-ua .error").show();
        } else {
            $("#modal-login-with-ua .form-submit-button").hide();
            $("#modal-login-with-ua .error").hide();
            $("#modal-login-with-ua .progress").show();

            // get user info
            const email = formLoginWithUA["login-with-ua-email"].value;
            const password = formLoginWithUA["login-with-ua-password"].value;

            // log the user in
            auth.signInWithEmailAndPassword(email, password)
                .then((user) => {
                    if ($(".modal")) {
                        M.Modal.getInstance($(".modal")).close();
                        $(".modal").modal();
                    }
                    // if (window.location.href.search(/.*\/demo\.html/i) >= 0)
                    //     window.location = "./index.html";

                    // Request attendance
                    var fetchAttendance = firebase
                        .functions()
                        .httpsCallable("fetchAttendanceV2");

                    console.log(user);

                    fetchAttendance().then((result) => {
                        if (result.data.desc != "error") {
                            sessionStorage.setItem(
                                "attendanceData",
                                JSON.stringify(result.data)
                            );
                            M.toast({ html: "attendance synced" });
                        } else {
                            M.toast({ html: "attendance couldn't be synced" });
                        }
                    });
                })
                .catch(function (error) {
                    grecaptcha.reset();
                    $("#modal-login-with-ua .error").text(error.message);
                    $("#modal-login-with-ua .error").show();
                    $("#modal-login-with-ua .progress").hide();
                    $("#modal-login-with-ua .form-submit-button").show();
                });
        }
    });
}

// login with UIMS
const formLoginWithUIMS = document.querySelector("#login-with-uims-form");
if (formLoginWithUIMS != null) {
    formLoginWithUIMS.addEventListener("submit", (e) => {
        e.preventDefault();
        $("#modal-login-with-uims .form-submit-button").hide();
        $("#modal-login-with-uims .error").hide();
        $("#modal-login-with-uims .progress").show();
        setTimeout(function () {
            $("#modal-login-with-uims .error").text("sorry, we just closed.");
            $("#modal-login-with-uims .error").show();
            $("#modal-login-with-uims .progress").hide();
        }, 3000);
    });
}

// logout
const logoutTriggers = document.querySelectorAll(".logout-fx");

logoutTriggers.forEach((logoutTrigger) => {
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
});
