const SerialPort = require("serialport");

const SerialQueue = class {

	constructor(device, options) {

		this.serialPort = new SerialPort(device, options);

		this.queue = [];
		this.isProcessing = false;
	}

	connect() {

		this.serialPort.on("close", function (err) {
			console.log("Serial port was closed");
		});

		return new Promise((resolve, reject) => {

			this.serialPort.on("open", () => resolve());
			this.serialPort.on("error", () => reject());
		});
	}

	process() {

		this.isProcessing = true;

		const item = this.queue.shift();

		const onData = data => {

			this.serialPort.removeListener("data", onData);

			console.log(`Data received: ${data}`);

			item.resolve(data.toString("utf8"));

			if (this.queue.length === 0) {

				this.isProcessing = false;
				return;
			}

			setTimeout(() => {

				this.process();

			}, 2000);
		};

		this.serialPort.on("data", onData);

		this.serialPort.write(`${item.command}\r`);
	}

	send(command) {

		return new Promise((resolve, reject) => {

			this.queue.push({
				resolve: resolve,
				reject: reject,
				command: command
			});

			if (this.isProcessing)
				return;
			
			this.process();
		});
	}
};

module.exports = SerialQueue;