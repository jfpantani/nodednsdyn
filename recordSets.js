const credentials = require("./credentials");

/* listRecord:
        Here is the function that lists 
        records that belong to your zone, 
        it only extracts the ip which is what 
        we want.
 */

function listRecord() {

    // Load aws-sdk

    const AWS = require('aws-sdk');

    const accessKeyId = credentials.accessKeyId;
    const secretAccessKey = credentials.secretAccessKey;

    AWS.config.update({
        accessKeyId,
        secretAccessKey,
        region: 'us-east-1'
    });

    var params = {
        HostedZoneId: credentials.HostedZoneId,
        StartRecordName: credentials.RecordName,
        StartRecordType: 'A',
        MaxItems: '1'
    };

    const route53 = new AWS.Route53();

    run().catch(err => console.log(err));

    async function run() {

        const res = await route53.listResourceRecordSets(params).promise();

        //console.log(res);
        //console.log(res.ResourceRecordSets[0].ResourceRecords[0].Value);

        return res.ResourceRecordSets[0].ResourceRecords[0].Value;
    }

    return run();
}

exports.list = async function () { return (await listRecord()); }

/* changeRecord:
         If ip of record is different from 
         current internet address, we must call changeRecord 
         to update the record to your new address.
*/

function changeRecord(ip) {

    const currentIP = ip;

    // Load aws-sdk

    const AWS = require('aws-sdk');

    const accessKeyId = credentials.accessKeyId;
    const secretAccessKey = credentials.secretAccessKey;

    AWS.config.update({
        accessKeyId,
        secretAccessKey,
        region: credentials.region
    });

    var params = {
        ChangeBatch: {
            Changes: [
                {
                    Action: "UPSERT",
                    ResourceRecordSet: {
                        Name: credentials.RecordName,
                        ResourceRecords: [
                            {
                                Value: ip
                            }
                        ],
                        TTL: 60,
                        Type: "A"
                    }
                }
            ]
        },
        HostedZoneId: credentials.HostedZoneId
    };

    const route53 = new AWS.Route53();

    run().catch(err => console.log(err));

    async function run() {

        const res = await route53.changeResourceRecordSets(params).promise();

        //console.log(res);

        return res;
    }

    return run();

}

exports.change = async function (ip) { return (await changeRecord(ip)); }