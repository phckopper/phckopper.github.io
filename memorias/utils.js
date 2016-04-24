// Roubei do StackOverflow hihihi
var toHex = function(d) {
    return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
}

// Gera memória aleatória porque eu tenho preguiça de popular eu mesmo
var generatemmap = function(size, type) {
	var mmap = [];

	/*
	for (var i = 0; i < size + 1; i++) {
		mmap.push(Math.round(Math.random() * 255));
	};
	*/
	if(type === "ramp") {
		for (var i = 0; i < size + 1; i++) {
			mmap.push(i);
		};

		return mmap;
	}
	if(type === "square") {
		for (var i = 0; i < size + 1; i++) {
			mmap.push(i < 128 ? 0 : 255);
		};

		return mmap;
	}
	if(type === "triangle") {
		var i = 0
		while(i < size/2) {
			mmap.push(i*2);
			i++;
		};
		while(i) {
			mmap.push(i*2);
			i--;
		};
		console.log(mmap);
		return mmap;
	}

	if(type === "sine") {
		var i = 0;
		var step = (Math.PI*2)/size

		console.log(step);
		
		while(i < Math.PI * 2) {
			mmap.push(Math.round(Math.sin(i) * 128) + 128) ;
			i += step;
		}
		console.log(mmap);
		return mmap;
	}
}

// Retorna array com bits
var toBitArray = function(n) {
	var tmp = n.toString(2);
	while(tmp.length < 8)
		tmp = "0" + tmp;
	return tmp;
}

// Retorna tensão em volts a partir da entrada do DAC
var toVolts = function(n) {
	n = n/255 * 5;
	return n.toFixed(2) + "V";
}
