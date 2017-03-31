// Convert a number to a hexidecimal with zero padding
// eg.
//     numberToHex(10, 2) // 0A
//     numberToHex(15, 0) // F
//     numberToHex(35, 4) // 0023
//
const numberToHex = function(decimal, padding) {

	let hex = decimal.toString(16).toUpperCase();

	const zeros = padding - hex.length;

	if (zeros <= 0)
		return hex;

	for (var i = 0; i < zeros; i++) {
		hex = `0${hex}`;
	}

	return hex;
};

module.exports = {
	numberToHex: numberToHex
};