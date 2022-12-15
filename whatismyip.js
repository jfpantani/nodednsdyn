'use strict'

// Load configuration
const config = require("./config");

/* Find your public internet address by query a dns server
   what reply client own address.*/

function tlsdnsQuery() {

    const tls = require('tls')
    const dnsPacket = require('dns-packet')

    var response = null;
    var expectedLength = 0;
    let myIp1 = null;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    const buf = dnsPacket.streamEncode({
        type: 'query',
        id: getRandomInt(1, 65534),
        flags: dnsPacket.RECURSION_DESIRED,
        questions: [{
            type: 'A',
            name: 'myip.opendns.com'
        }]
    })

    const context = tls.createSecureContext({
        maxVersion: 'TLSv1.3',
        minVersion: 'TLSv1.2'
    })

    const options = {
        port: 853,
        host: '208.67.222.222',
        servername: 'dns.umbrella.com',
        rejectUnauthorized: true,
        secureContext: context
    }

    const client = tls.connect(options, () => {
        //console.log('client connected')
        client.write(buf)
    })

    client.on('data', function (data) {
        //console.log('Received response: %d bytes', data.byteLength)
        if (response == null) {
            if (data.byteLength > 1) {
                const plen = data.readUInt16BE(0)
                expectedLength = plen
                if (plen < 12) {
                    throw new Error('below DNS minimum packet length')
                }
                response = Buffer.from(data)
            }
        } else {
            response = Buffer.concat([response, data])
        }

        if (response.byteLength >= expectedLength) {
            var dataPacket = dnsPacket.streamDecode(response);
            //console.log(dataPacket.answers);
            myIp1 = dataPacket.answers[0].data;
            client.destroy();
        }
    })

    client.on('end', () => {
        console.log('Connection ended')
    })

    return new Promise((resolve) => {
        setTimeout(() => {
            if (myIp1 != null) {
                resolve(myIp1);
                client.destroy()
            } else {
                resolve("TIMEOUT");
                client.destroy();
            }
        }, config.DNS_timeout);
    });
}

exports.getIp = async function () { return (await tlsdnsQuery()); }