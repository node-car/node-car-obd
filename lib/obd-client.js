const SerialQueue = require("./serial-queue");
const numberUtil = require("../util/number-util");

const protocols = {
	"0": "Auto",
	"1": "SAE J1850 PWM (41.6 kbaud)",
	"2": "SAE J1850 VPW (10.4 kbaud)",
	"3": "ISO 9141-2 (5 baud init, 10.4 kbaud)",
	"4": "ISO 14230-4 KWP (5 baud init, 10.4 kbaud)",
	"5": "ISO 14230-4 KWP (fast init, 10.4 kbaud)",
	"6": "ISO 15765-4 CAN (11 bit ID, 500 kbaud)",
	"7": "ISO 15765-4 CAN (29 bit ID, 500 kbaud)",
	"8": "ISO 15765-4 CAN (11 bit ID, 250 kbaud) - used mainly on utility vehicles and Volvo",
	"9": "ISO 15765-4 CAN (29 bit ID, 250 kbaud) - used mainly on utility vehicles and Volvo"
};

const ObdClient = class {

	constructor(device, options) {

		this.serialQueue = new SerialQueue(device, options);
	}

	connect() {

		return this.serialQueue.connect().then(() => {

			console.log("Connected");

			this.query("@1").then(result => console.log(result));
			this.query("@1").then(result => console.log(result));

			//this.initialize();
		});
	}

	execute(command, parameter) {

		const commandString = `AT${command}${parameter}`;

		return this.serialQueue.send(commandString).then(result => {

			if (result !== "OK")	
				throw `Command '${commandString}' failed. Returned '${result}'`;
		});
	}

	query(command) {

		const commandString = `AT${command}`;

		return this.serialQueue.send(commandString);
	}

	initialize() {

		return Promise.all([
			this.reset(),
			this.enableEcho(false),
			this.enableLinefeed(false),
			this.enableSpaces(false),
			this.enableHeaders(false),
			this.setAdaptiveTiming("auto2"),
			this.setProtocol(0)
		]);
	}

	reset() {
		return this.execute("Z");
	}

	enableEcho(enabled) {
		return this.execute("E", enabled ? 1 : 0);
	}

	enableLinefeed(enabled) {
		return this.execute("L", enabled ? 1 : 0);
	}

	enableSpaces(enabled) {
		return this.execute("S", enabled ? 1 : 0);
	}

	enableHeaders(enabled) {
		return this.execute("H", enabled ? 1 : 0);
	}

	setAdaptiveTiming(timingType) {

		switch (timingType) {

			case "auto1":
				return this.execute("AT", 1);

			case "auto2":
				return this.execute("AT", 2);

			case "off":
			default:
				return this.execute("AT", 0);
		}
	}

	setProtocolTimeout(timeout) {

		if (timeout % 4 !== 0)
			throw "Timeout must be a multiple of 4";

		const convertedTimeout = timeout / 4;
		const hexTimeout = numberUtil.numberToHex(convertedTimeout, 2);

		return this.execute("ST", hexTimeout);
	}

	setProtocol(protocolId) {

		if (!protocols.hasOwnProperty(protocolId))
			throw `Invalid protocol ID. Valid protocols are: \n${ JSON.stringify(protocols, null, 4) }`;

		return this.execute("SP", protocolId);
	}

	getCurrentProtocol() {

		return this.query("DPN").then(number => {

			return protocols[number] || "Unknown";	
		});
	}
}

module.exports = ObdClient;