function adjustNavbarTitle() {
    if (window.innerWidth < 480) {
        $(".brand-logo").text("UIMS Assist");
    } else {
        $(".brand-logo").text("UIMS Assistant");
    }
}

$(window).resize(adjustNavbarTitle);
