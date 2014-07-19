var db = new Firebase('https://crackling-fire-6957.firebaseio.com/');
db.on('child_added', function (snapshot) {
	var post = snapshot.val();
	$('#content').append('<div class="post">' + post.text + '<br><hr><span class="target">' + post.target + '</span></div><hr>');
});
$('#text').keypress(function (e){
	if (e.keyCode == 13){
		sendPost();
	}
});
$('#target').keypress(function (e){
	if (e.keyCode == 13){
		sendPost();
	}
});
$('#btnSend').click(sendPost());
function sendPost(){
	console.log('sendPost invoked!')
	var text = $('#text').val();
	var target = $('#target').val();
	db.push({text: text, target: target});
	$('#text').val('');
	$('#target').val('');
}
console.log('hi');