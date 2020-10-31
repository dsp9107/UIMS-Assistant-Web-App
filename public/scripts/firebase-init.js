var firebaseConfig = {
	apiKey: "AIzaSyARepvtLqm28z8JLo58YBWdBIdcyWsTJfY",
	authDomain: "uims-assistant.firebaseapp.com",
	databaseURL: "https://uims-assistant.firebaseio.com",
	projectId: "uims-assistant",
	storageBucket: "uims-assistant.appspot.com",
	messagingSenderId: "190486161620",
	appId: "1:190486161620:web:b511dcaf2a4a0c172df341",
	measurementId: "G-3806LQMTMS",
};

const fbApp = firebase.initializeApp(firebaseConfig);

firebase.analytics();
firebase.performance();

const fbFuncs = firebase.functions();

ifInDebugMode();

function ifInDebugMode() {
	if (
		location.hostname === "localhost" ||
		location.hostname === "127.0.0.1"
	) {
		console.info("DEBUG MODE");
		fbFuncs.useFunctionsEmulator("localhost", 5001);
	}
}
