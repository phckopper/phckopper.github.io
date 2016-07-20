function eita() {
	FB.login(function (auth) {
		console.log(auth.userID);
	})
}