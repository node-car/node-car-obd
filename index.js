const ObdClient = require("./lib/obd-client");

const obdClient = new ObdClient("/dev/ttyUSB0", {
    baudrate: 115200
});

obdClient.connect();