var db = new Firebase('https://crackling-fire-6957.firebaseio.com/');
db.on('child_added', function (snapshot) {
	var post = snapshot.val();
	$('#content').prepend('<div class="post">' + post.text + '<br><hr><span class="target">' + post.target + '</span></div><hr>');
});
var userUid;
var auth = new FirebaseSimpleLogin(db, function(error, user) {
  if (error) {
    alert("MEU DEUS DEU ERRO");
    console.log(error);
  } else if (user) {
    userUid = user.uid;
    console.log('User ID: ' + user.uid + ', Provider: ' + user.provider);
  } else {
    // user is logged out
  }
});
function sendPost(){
	if (userUid == null) {
		alert('Por favor, entre antes de postar');
		auth.login('facebook');
	}
	else {
		console.log('sendPost invoked!')
		var text = $('#text').val();
		var target = $('#target').val();
		db.push({text: text, target: target, uid: userUid});
		$('#text').val('');
		$('#target').val('');
	}	
}
console.log('hi');