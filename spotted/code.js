function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);
      }

var ctx;
var canvas;
var img;

(function () {
	'use strict'

	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	ctx.textAlign="center"; 
	ctx.font="40px Raleway"; 

	img = new Image();
	img.src = 'base.jpg';

	img.addEventListener("load", function() {
		ctx.drawImage(img, 0, 0);

		//wrapText(ctx, "Oi mozaum te amo blabla meu cuti cuti te adoro meu chuchu não sei trovar whatever", canvas.width/2, 75, 450, 50); 


	}, false);
})();

function draw() {
	ctx.drawImage(img, 0, 0);

	wrapText(ctx, document.getElementById("mensagem").value, canvas.width/2, 60, 450, 50); 
	if (document.getElementById("radioH").checked) {
		ctx.fillText("H", canvas.width/2, 380);
	};
	if (document.getElementById("radioM").checked) {
		ctx.fillText("M", canvas.width/2, 380);
	};
}

function dlCanvas() {
  var dt = canvas.toDataURL('image/png');
  /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
  dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');

  /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
  dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');

  this.href = dt;
};
document.getElementById("dl").addEventListener('click', dlCanvas, false);