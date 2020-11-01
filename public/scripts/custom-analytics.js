// EVENTS - Navbar

$(".brand-logo").click(() => {
	firebase.analytics().logEvent("click-nav-brand-logo");
});

$("#nav-cta-btn-see-demo").click(() => {
	firebase.analytics().logEvent("click-nav-cta-btn-see-demo");
});

$("#nav-cta-btn-download-chrome-ext").click(() => {
	firebase.analytics().logEvent("click-nav-cta-btn-download-chrome-ext");
});

// EVENTS - Sidenav

$(".sidenav-trigger").click(() => {
	firebase.analytics().logEvent("click-sidenav-trigger");
});

$("#sidenav-brand-logo").click(() => {
	firebase.analytics().logEvent("click-sidenav-brand-logo");
});

$("#sidenav-cta-btn-download-chrome-ext").click(() => {
	firebase.analytics().logEvent("click-sidenav-cta-btn-download-chrome-ext");
});

$("#sidenav-cta-btn-see-demo").click(() => {
	firebase.analytics().logEvent("click-sidenav-cta-btn-see-demo");
});

$("#sidenav-cta-btn-go-premium").click(() => {
	firebase.analytics().logEvent("click-sidenav-cta-btn-go-premium");
});

$("#sidenav-cta-btn-login-with-uims-creds").click(() => {
	firebase
		.analytics()
		.logEvent("click-sidenav-cta-btn-login-with-uims-creds");
});

// EVENTS - Modal

$("#modal-premium-portfolio-contact").click(() => {
	firebase.analytics().logEvent("click-modal-premium-portfolio-contact");
});

// EVENTS - Landing Page

$("#landing-collapsible-chrome-ext").click(() => {
	firebase.analytics().logEvent("click-landing-collapsible-chrome-ext");
});

$("#landing-collapsible-desktop-app").click(() => {
	firebase.analytics().logEvent("click-landing-collapsible-desktop-app");
});

$("#landing-cta-btn-download-chrome-ext").click(() => {
	firebase.analytics().logEvent("click-landing-cta-btn-download-chrome-ext");
});

$("#landing-cta-btn-go-premium").click(() => {
	firebase.analytics().logEvent("click-landing-cta-btn-go-premium");
});

$("#landing-cta-btn-see-demo").click(() => {
	firebase.analytics().logEvent("click-landing-cta-btn-see-demo");
});

// EVENTS - Footer

$("#footer-social-github").click(() => {
	firebase.analytics().logEvent("click-footer-social-github");
});

$("#footer-social-youtube").click(() => {
	firebase.analytics().logEvent("click-footer-social-youtube");
});

$("#footer-social-soundcloud").click(() => {
	firebase.analytics().logEvent("click-footer-social-soundcloud");
});

$("#footer-social-linkedin").click(() => {
	firebase.analytics().logEvent("click-footer-social-linkedin");
});

$("#footer-social-instagram").click(() => {
	firebase.analytics().logEvent("click-footer-social-instagram");
});

$("#footer-social-twitter").click(() => {
	firebase.analytics().logEvent("click-footer-social-twitter");
});

$("#footer-copyright-firebase").click(() => {
	firebase.analytics().logEvent("click-footer-copyright-firebase");
});

$("#footer-copyright-portfolio-landing").click(() => {
	firebase.analytics().logEvent("click-footer-copyright-portfolio-landing");
});
