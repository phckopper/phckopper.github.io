'use strict'


// Desenha o mapa da memoria
var drawmmap = function(ctx, mmap, highlight) {
	// Margens
	var x = 45;
	var y = 30;

	var paddingX = 25;
	var paddingY = 35;

	var displayWidth = 16;

	// Desenha o indicador de offset
	ctx.fillStyle = "red";
	for (var i = 0; i < displayWidth; i++) {
		if(highlight % displayWidth == i) {
			ctx.font = "bold 16px monospace";
		}
		ctx.fillText(toHex(i), x, y);
		ctx.font = "16px monospace";
		x += paddingX;
	};

	// Volta ao normal
	ctx.fillStyle = "black";
	x = 20;
	y = y + 35;

	var lineY = 0;

	ctx.fillStyle = "red";
	if(Math.floor(highlight/displayWidth) == lineY) {
		ctx.font = "bold 16px monospace";
	}
	ctx.fillText(toHex(lineY), x, y);
	ctx.fillStyle = "black";
	ctx.font = "16px monospace";
	x += paddingX;

	for (var i = 0; i < mmap.length; i++) {

		// Se for o caso, destaca o byte
		if(i == highlight) {
			//console.log('highlight');
			ctx.font = "bolder 20px monospace";
			ctx.fillStyle = "green";
		}

		// Desenha a string convertida para hexa
		ctx.fillText(toHex(mmap[i]), x, y);

		// Retorna ao normal (preto)
		if(i == highlight) {
			ctx.font = "16px monospace";
			ctx.fillStyle = "black";
		}

		var quebra = !((i + 1) % displayWidth) && !!i;

		//console.log(quebra);

		if(quebra && i < mmap.length - 1) {
			x = 20;
			y += paddingY;
			lineY++;
			console.log(Math.floor(highlight/displayWidth));
			if(Math.floor(highlight/displayWidth) == lineY) {
				ctx.font = "bold 16px monospace";
			}
			ctx.fillStyle = "red";
			ctx.fillText(toHex(lineY), x, y);
			ctx.fillStyle = "black";
			ctx.font = "16px monospace";

			x += paddingX;
		}
		else {
			x += paddingX;
		}

	};
}

var drawMemory = function(ctx, mmap, highlight) {
	var address = toBitArray(highlight);
	var output = toBitArray(mmap[highlight]);
	console.log(address);

	var marginX = 700;
	var marginY = 125;

	var busSize = 50;

	var sizeX = 200;
	var sizeY = 400;

	ctx.strokeRect(marginX, marginY, sizeX, sizeY);
	var IC1 = "EPROM";
	ctx.fillText(IC1, marginX + (sizeX/2) - (IC1.length *5), marginY + (sizeY/2));

	var paddingY = Math.round(sizeY / 9);
	var textStart =  marginX - busSize;
	var y = marginY + paddingY;

	// Desenha as entradas
	ctx.font = "bold 20px monospace";
	ctx.fillText(toHex(highlight), marginX - busSize*2, marginY + (sizeY/2));
	ctx.fillText("Endereço", marginX - busSize*3, marginY - busSize/2);
	ctx.fillText("Saída", marginX + sizeX + busSize*1.5, marginY - busSize/2);
	ctx.font = "16px monospace";

	for (var i = 0; i < address.length; i++) {
		if(address[i] === "1") {
			ctx.lineWidth = 3;
			ctx.strokeStyle = "blue";
		}

		ctx.fillText("E" + i, textStart, y - 3);

		ctx.beginPath();
		ctx.moveTo(textStart, y); // min
		ctx.lineTo(marginX, y);
		ctx.stroke();

		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;

		y += paddingY;
	};

	var y = marginY + paddingY;

	var measurementSpacing = 50;
	ctx.font = "bold 20px monospace";
	ctx.fillText(toHex(mmap[highlight]), marginX + sizeX + busSize*1.5, marginY + (sizeY/2) - measurementSpacing);
	ctx.fillText(mmap[highlight], marginX + sizeX + busSize*1.5, marginY + (sizeY/2));
	ctx.fillText(toVolts(mmap[highlight]), marginX + sizeX + busSize*1.5, marginY + (sizeY/2) + measurementSpacing);
	ctx.font = "16px monospace";

	// Desenha as saídas
	for (var i = 0; i < output.length; i++) {
		if(output[i] === "1") {
			ctx.lineWidth = 3;
			ctx.strokeStyle = "blue";
		}

		ctx.fillText("S" + i, marginX + sizeX + busSize - 20, y - 3);

		ctx.beginPath();
		ctx.moveTo(marginX + sizeX, y); // min
		ctx.lineTo(marginX + sizeX + busSize, y);
		ctx.stroke();

		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;

		y += paddingY;
	};
}

var visible = Array(255);
var drawMiniPlot = function(ctx, mmap, highlight) {
	visible.push(255 - mmap[highlight]);
	visible.shift();

	var marginX = 1050;
	var marginY = 175;

	var sizeX = 200;
	var sizeY = 256;

	ctx.strokeRect(marginX, marginY, sizeX, sizeY);

	ctx.beginPath();
	ctx.strokeStyle = "green";
	ctx.lineWidth = 3;

	for (var i = 0; i < visible.length; i++) {
		var x = i*(200/255) + marginX;

		ctx.lineTo(x, visible[i] + marginY);
		ctx.moveTo(x, visible[i] + marginY);
		
	};
	ctx.stroke();
	ctx.strokeStyle = "black";
	ctx.lineWidth = 1;
}

// Desenha a animação
var draw = function(mmap, highlight) {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");

	// Limpa e seta configurações do canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "16px monospace";

	drawmmap(ctx, mmap, highlight);
	drawMemory(ctx, mmap, highlight);
	drawMiniPlot(ctx, mmap, highlight);
}

var running;

var main = function() {
	if(running) {
		console.log("another animation running, clearing");
		clearInterval(running);
	}
	var size = 255;

	var type = document.getElementById("dropdown").value;
	var speed = document.getElementById("speed").value;

	var mmap = generatemmap(size, type);
	var i = 0;
	running = setInterval(function() {
		i = (i < size) ? i + 1: 0;
		draw(mmap, i);
	}, speed);
}

