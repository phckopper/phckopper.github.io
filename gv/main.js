function eita() {
	FB.login(function (auth) {
		FB.getLoginStatus(function(response) {
		  if (response.status === 'connected') {
		    // the user is logged in and has authenticated your
		    // app, and response.authResponse supplies
		    // the user's ID, a valid access token, a signed
		    // request, and the time the access token 
		    // and signed request each expire
		    var uid = response.authResponse.userID;
		    console.log(uid);

		    var url = 'http://vps88682.vps.ovh.ca:5000/guaxinify.jpg?img=' + encodeURI("https://graph.facebook.com/"+ uid + "/picture?width=9999&height=9999");
		    
		    document.getElementById("img").src = url;

		    FB.ui({
			  method: 'feed',
			  picture: url,
			  caption: '#SomosTodosGV',
			}, function(response){});
		  }
		})
	})
}