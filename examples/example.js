const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline")
const nmea = require("..");

const port = new SerialPort(
    "/dev/ttyUSB0",
    {
        baudRate: 9600
    }
);

const parser = port.pipe(new Readline({ delimiter: '\r\n' }))

parser.on("data", line => {
    try {
        const packet = nmea.parseNmeaSentence(line);

        if (packet.sentenceId === "RMC" && packet.status === "valid") {
            console.log("Got location via RMC packet:", packet.latitude, packet.longitude);
        }

        if (packet.sentenceId === "GGA" && packet.fixType !== "none") {
            console.log("Got location via GGA packet:", packet.latitude, packet.longitude);
        }

        if (packet.sentenceId === "GSA") {
            console.log("There are " + packet.satellites.length + " satellites in view.");
        }
    } catch (error) {
        console.error("Got bad packet:", line, error);
    }
});
