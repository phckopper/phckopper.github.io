'use strict'

var plot = function(fileData, size) {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");

	var data = [];

	for (var i = fileData.length - 1; i >= 0; i--) {
		data.push(255 - fileData[i]);
	};

	console.log(size);

	canvas.width = size;
	canvas.height = 255;

	var endPos = size - 25;

	ctx.beginPath();
	ctx.moveTo(0, 127); // meio
	ctx.lineTo(size, 127);
	ctx.stroke();

	var min = Math.max.apply(null, data);

	ctx.beginPath();
	ctx.moveTo(0, min); // min
	ctx.lineTo(size, min);
	ctx.stroke();
	ctx.fillText(255 - min, 0, min);
	ctx.fillText(((255 - min)/255*5).toFixed(2) + "V", endPos, min);

	var max = Math.min.apply(null, data);

	ctx.beginPath();
	ctx.moveTo(0, max); // max
	ctx.lineTo(size, max);
	ctx.stroke();
	ctx.fillText(255 - max, 0, max);
	ctx.fillText(((255 - max)/255*5).toFixed(2) + "V", endPos, max);

	ctx.fillText("0", 0, 255);
	ctx.fillText("127", 0, 127);
	ctx.fillText("255", 0, 10);



	ctx.fillText("0V", endPos + 10, 255);
	ctx.fillText("2.5V", endPos, 127);
	ctx.fillText("5V", endPos + 10, 10);

	ctx.beginPath();
	ctx.moveTo(0, data[0]);
	ctx.lineWidth = 3;

	for (var i = 1; i < data.length; i++) {
		ctx.lineTo(i, data[i]);
		ctx.moveTo(i, data[i]);
	};

	ctx.stroke();
}

var handleFiles = function(file) {
	file = file[0];
	console.log(file);
	
	var reader = new FileReader();
	reader.readAsBinaryString(file);
	
	reader.onload = function(evt) {
		var result = evt.target.result;
		var arr = [];
		for (var i = result.length - 1; i >= 0; i--) {
			arr.push(result[i].charCodeAt());
		};
		plot(arr, file.size);
	};
};