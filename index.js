
//  Function that's find out your router public ip.
const whatismyip = require("./whatismyip");

// Functions that use aws-sdk to list and change our dns record.
const recordSets = require("./recordSets");

// To validate ip number.
const net = require('net');

void async function () {
    console.log("Checking the current configuration.");

    // Get our router current public ip address
    var mycurrentIP = await whatismyip.getIp();

    console.log("Current internet address: " + mycurrentIP);

    // Get ip of our dns record
    var mycurrentRecord = await recordSets.list();

    console.log("Current record address: " + mycurrentRecord);

    // Do some validation 
    if (net.isIP(mycurrentIP) && net.isIP(mycurrentRecord)) {

        // If ip address diverge, set record with router ip.
        if (mycurrentIP != mycurrentRecord) {
            console.log("Requires action: Internet address and record differ.");
            var test = await recordSets.change(mycurrentIP);
            console.log(test);
        } else {
            // If not diverge, do nothing
            console.log("Nothing to do: Internet address compatible with record");
        }
    } else {
        // If ip is not valide show FATAL ERROR.
        console.error("FATAL ERROR!");
    }
}()
