'use strict'

var plot = function(fileData, size) {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");

	var data = [];

	/* Invertemos a array verticalmente
	 * Por quê?
	 * Pois, enquanto a numeração "real" funciona debaixo para cima
	 *  3 |
	 *  2 |
	 *  1 |________
	 *   0  1  2  3
	 *
	 * O canvas se orienta assim
	 *
	 *   0_1_2_3
	 *  1|
	 *  2|
	 *  3|
	 *
	 */
	for (var i = fileData.length - 1; i >= 0; i--) {
		data.push(255 - fileData[i]);
	};

	console.log(size);

	// Redimensiona o canvas para o tamanho do arquivo
	canvas.width = size;
	canvas.height = 255;

	// Define uma posição "final" com margem para impressão das marcações
	var endPos = size - 25;

	// Desenha a linha do meio
	ctx.beginPath();
	ctx.moveTo(0, 127);
	ctx.lineTo(size, 127);
	ctx.stroke();

	// Nesse caso, o minimo será o máximo porque a array está invertida verticalmente
	var min = Math.max.apply(null, data);

	// Plota a linha tangente ao mínimo da onda
	ctx.beginPath();
	ctx.moveTo(0, min); // min
	ctx.lineTo(size, min);
	ctx.stroke();
	ctx.fillText(255 - min, 0, min);
	ctx.fillText(((255 - min)/255*5).toFixed(2) + "V", endPos, min);

	// Nesse caso, o máximo será o mínimo porque a array está invertida verticalmente
	var max = Math.min.apply(null, data);

	// Plota a linha tangente ao máximo da onda
	ctx.beginPath();
	ctx.moveTo(0, max); 
	ctx.lineTo(size, max);
	ctx.stroke();
	ctx.fillText(255 - max, 0, max);
	ctx.fillText(((255 - max)/255*5).toFixed(2) + "V", endPos, max);

	// Imprime as marcações de 0, 127 e 255
	ctx.fillText("0", 0, 255);
	ctx.fillText("127", 0, 127);
	ctx.fillText("255", 0, 10);

	// Imprime as marcações de 0, 2.5 e 5 Volts
	ctx.fillText("0V", endPos + 10, 255);
	ctx.fillText("2.5V", endPos, 127);
	ctx.fillText("5V", endPos + 10, 10);

	// Inicializa o contorno e move a caneta para a posição do primeiro ponto
	ctx.beginPath();
	ctx.moveTo(0, data[0]);
	ctx.lineWidth = 3;

	// Risca
	for (var i = 1; i < data.length; i++) {
		ctx.lineTo(i, data[i]);
		ctx.moveTo(i, data[i]);
	};

	// E taraça
	ctx.stroke();
}


// Função que será chamada quando escolhermos um arquivo
var handleFiles = function(file) {
	// file será uma array com apenas um elemento, então facilitamos a vida
	file = file[0];

	// Zeramos o "escolhedor de arquivos". Se não fizermos isso não conseguiremos atualizar os arquivos
	document.getElementById("filePicker").value = "";

	// Lê o arquivo como uma string binária
	var reader = new FileReader();
	reader.readAsBinaryString(file);
	
	// Define uma função para ser chamada quando a leitura for completada
	reader.onload = function(evt) {
		var result = evt.target.result;
		var arr = [];

		// Convertemos os valores binários para inteiros e armazenamos
		for (var i = result.length - 1; i >= 0; i--) {
			arr.push(result[i].charCodeAt());
		};

		// Mandamos plotar
		plot(arr, file.size);
	};
};