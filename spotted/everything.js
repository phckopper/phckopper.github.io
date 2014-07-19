var db = new Firebase('https://crackling-fire-6957.firebaseio.com/');
db.on('child_added', function (snapshot) {
	var post = snapshot.val();
	$('#content').append('<span class="post">' + post.text + '<br><span class="target">' + post.target + '</span>');
})
