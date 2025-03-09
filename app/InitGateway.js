const {buildCCPOrg1, buildWallet, buildCCPOrg2} = require("../../test-application/javascript/AppUtil.js");
const {Wallets, Gateway} = require("fabric-network");
const path = require("path");
let { getUSER_ID} = require('./Consts');

async function initGatewayForOrg1() {
    console.log('\n--> Fabric client user & Gateway init: Using Org1 identity to Org1 Peer');
    const ccpOrg1 = buildCCPOrg1();
    const walletPathOrg1 = path.join(__dirname, 'wallet', 'org1');
    const walletOrg1 = await buildWallet(Wallets, walletPathOrg1);
    try {
        // Create a new gateway for connecting to Org's peer node.
        const gatewayOrg1 = new Gateway()
        //connect using Discovery enabled
        await gatewayOrg1.connect(ccpOrg1,
            {wallet: walletOrg1, identity: getUSER_ID(), discovery: {enabled: true, asLocalhost: true}});
        return gatewayOrg1;
    } catch (error) {
        console.error(`initGatewayForOrg1 -- -- Error in connecting to gateway for Org1: ${error}`);
        process.exit(1);
    }
}

async function initGatewayForOrg2() {
    console.log('\n--> Fabric client user & Gateway init: Using Org2 identity to Org2 Peer');
    const ccpOrg2 = buildCCPOrg2();
    const walletPathOrg2 = path.join(__dirname, 'wallet', 'org2');
    const walletOrg2 = await buildWallet(Wallets, walletPathOrg2);
    try {
        // Create a new gateway for connecting to Org's peer node.
        const gatewayOrg2 = new Gateway();
        await gatewayOrg2.connect(ccpOrg2,
            {wallet: walletOrg2, identity: getUSER_ID(), discovery: {enabled: true, asLocalhost: true}});
        return gatewayOrg2;
    } catch (error) {
        console.error(`Error in connecting to gateway for Org2: ${error}`);
        process.exit(1);
    }
}
module.exports = {initGatewayForOrg1, initGatewayForOrg2};
