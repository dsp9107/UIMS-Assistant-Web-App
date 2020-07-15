// setup materialize components

$(document).ready(function () {
    $(".fixed-action-btn").floatingActionButton();
    $(".tooltipped").tooltip();
    $(".modal").modal();
});

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
