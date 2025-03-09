const {buildCCPOrg2, buildWallet} = require("../../test-application/javascript/AppUtil");
const {buildCAClient, registerAndEnrollUser} = require("../../test-application/javascript/CAUtil");
const path = require("path");
const {Wallets} = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const {ORG2, getCONNECT_CONTRACT} = require("./Consts");
const {Connect, Disconnect} = require("./ConnectAndDisconnect.js");

async function TestFunc() {
    console.log(`\nTestFunc Start----------------------------------------\n`);
    const ccpOrg2 = buildCCPOrg2();
    const walletPathOrg2 = path.join(__dirname, 'wallet', 'org2');
    const walletOrg2 = await buildWallet(Wallets, walletPathOrg2);
    const caOrg2Client = buildCAClient(FabricCAServices, ccpOrg2, 'ca.org2.example.com');
    const userId = '1115'

    await registerAndEnrollUser(caOrg2Client, walletOrg2, ORG2, userId, 'org2.department1');
    await Connect(ORG2, userId);
    await getCONNECT_CONTRACT().submitTransaction('RegisterUser', userId, "TEST User", "100");
    // 50 токенов
    await getCONNECT_CONTRACT().submitTransaction('UpdateInfo', userId, "TEST User", "95", "SWAT");
    // 50 токенов
    await getCONNECT_CONTRACT().submitTransaction('AddLicense', userId, "444");
    // 50 токенов
    Disconnect();
    try {
        console.log(`--4-- `);
        await Connect(ORG2, userId);
        await getCONNECT_CONTRACT().submitTransaction('AddCar', userId, "B", "950000", "444");
        // 50 токенов
        Disconnect();
        console.log(`--4-- WORK\n`);
    } catch (error) {
        console.log(`--4-- WORK  --  ERROR - ${error}\n`);
    }
    try {
        console.log(`--4.1-- `);
        await Connect(ORG2, userId);
        await getCONNECT_CONTRACT().submitTransaction('AddCar', userId, "B", "901", "4442");
        // 50 токенов
        Disconnect();
        console.log(`--4/1-- WORK\n`);
    } catch (error) {
        console.log(`--4.1-- WORK  --  ERROR - ${error}\n`);
    }
    try {
        console.log(`--6-- `);
        await Connect(ORG2, userId);
        // async UpdateLicense(ctx, id, licenseId, now)
        await getCONNECT_CONTRACT().submitTransaction('UpdateLicense', userId, '000', new Date());
        // 50 токенов
        Disconnect();
        console.log(`--6-- WORK\n`);
    } catch (error) {
        console.log(`--6-- WORK  --  ERROR - ${error}\n`);
    }
    try {
        console.log(`--7-- `);
        await Connect(ORG2, userId);
        // async UpdateLicense(ctx, id, licenseId, now)
        await getCONNECT_CONTRACT().submitTransaction('UpdateLicense', userId, '333', new Date());
        // 50 токенов
        Disconnect();
        console.log(`--7-- WORK\n`);
    } catch (error) {
        console.log(`--7-- WORK  --  ERROR - ${error}\n`);
    }
    try {
        console.log(`--8-- `);
        await Connect(ORG2, userId);
        // async UpdateLicense(ctx, id, licenseId, now)
        await getCONNECT_CONTRACT().submitTransaction('setSends', userId, new Date());
        const ans = await getCONNECT_CONTRACT().submitTransaction('ReadAsset', userId);
        console.log(JSON.parse(ans));

        // 50 токенов
        Disconnect();
        console.log(`--8-- WORK\n`);
    } catch (error) {
        console.log(`--8-- WORK  --  ERROR - ${error}\n`);
    }
    try {
        console.log(`--8.1-- `);
        await Connect(ORG2, userId);
        // async UpdateLicense(ctx, id, licenseId, now)
        await getCONNECT_CONTRACT().submitTransaction('setSends', userId, new Date());
        const ans = await getCONNECT_CONTRACT().submitTransaction('ReadAsset', userId);
        console.log(JSON.parse(ans));

        // 50 токенов
        Disconnect();
        console.log(`--8.1-- WORK\n`);
    } catch (error) {
        console.log(`--8.1-- WORK  --  ERROR - ${error}\n`);
    }
    try {
        console.log(`--9-- `);
        await Connect(ORG2, userId);
        // async UpdateLicense(ctx, id, licenseId, now)
        await getCONNECT_CONTRACT().submitTransaction('paySend', userId, 0);
        const ans = await getCONNECT_CONTRACT().submitTransaction('ReadAsset', userId);
        console.log(JSON.parse(ans));
        // async paySend(ctx, id, idxSend) {
        // 50 токенов
        Disconnect();
        console.log(`--9-- WORK\n`);
    } catch (error) {
        console.log(`--9-- WORK  --  ERROR - ${error}\n`);
    }
    try {
        console.log(`--GetAllAssets-- `);
        await Connect(ORG2, userId);
        const ans = await getCONNECT_CONTRACT().submitTransaction('GetAllAssets');
        console.log(JSON.parse(ans));
        // 50 токенов
        Disconnect();
        console.log(`--GetAllAssets-- WORK\n`);
    } catch (error) {
        console.log(`--GetAllAssets-- WORK  --  ERROR - ${error}\n`);
    }
    console.log(`\nTestFunc End----------------------------------------\n`);
}

module.exports = TestFunc
