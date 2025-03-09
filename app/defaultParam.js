'use strict';
const {getCONNECT_CONTRACT, ORG1, ORG2, defaultDrivers} = require("./Consts.js");
const {Connect, Disconnect, getGataway} = require("./ConnectAndDisconnect.js");
const {buildCCPOrg1, buildWallet, buildCCPOrg2} = require("../../test-application/javascript/AppUtil.js");
const {buildCAClient, enrollAdmin, registerAndEnrollUser} = require("../../test-application/javascript/CAUtil.js");
const {Wallets} = require("fabric-network");
const path = require("path");
const FabricCAServices = require("fabric-ca-client");

async function defaultParams() {
    try {
        // use a random key so that we can run multiple times
        // const assetKey = `asset-${Math.floor(Math.random() * 100) + 1}`;

        console.log(`Admins -----------------------------------------------------------`);
        const ccpOrg1 = buildCCPOrg1();
        const walletPathOrg1 = path.join(__dirname, 'wallet', 'org1');
        const walletOrg1 = await buildWallet(Wallets, walletPathOrg1);
        const caOrg1Client = buildCAClient(FabricCAServices, ccpOrg1, 'ca.org1.example.com');
        await enrollAdmin(caOrg1Client, walletOrg1, ORG1);

        const ccpOrg2 = buildCCPOrg2();
        const walletPathOrg2 = path.join(__dirname, 'wallet', 'org2');
        const walletOrg2 = await buildWallet(Wallets, walletPathOrg2);
        const caOrg2Client = buildCAClient(FabricCAServices, ccpOrg2, 'ca.org2.example.com');
        await enrollAdmin(caOrg2Client, walletOrg2, ORG2);

        console.log(`Bank -------------------------------------------------------------`);
        await registerAndEnrollUser(caOrg1Client, walletOrg1, ORG1, 'Bank', 'org1.department1');
        await Connect(ORG1, 'Bank');
        const BankGateway = getGataway();
        const BankConnect = getCONNECT_CONTRACT();
        await getCONNECT_CONTRACT().submitTransaction('Initialize', 'some', 'SOME', "12");
        console.log(`Token -- Initialize\n`)

        await getCONNECT_CONTRACT().submitTransaction('runFuncERC20_2', ['Mint', '1000']);
        const balanceBank = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['ClientAccountBalance'])
        console.log(`Balance Bank - ${balanceBank}`)

        console.log(`Drivers ----------------------------------------------------------`);
        for (const driver of defaultDrivers) {
            await registerAndEnrollUser(caOrg2Client, walletOrg2, ORG2, `${driver.id}`, 'org2.department1');
            await Connect(ORG2, `${driver.id}`);
            await getCONNECT_CONTRACT().submitTransaction('RegisterUser', `${driver.id}`, `${driver.FIO}`, `${driver.experience}`);
            await BankConnect.submitTransaction('runFuncERC20_2', ['Mint', '50']);
            console.log(`Mint - ${driver.FIO}`)
            const IDUser = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['ClientAccountID'])
            await BankConnect.submitTransaction('runFuncERC20_2', ['Transfer', IDUser, '50']);// Transfer: (ctx, to, value)
            console.log(`Transfer - ${driver.FIO}`)

            const balanceUser = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['ClientAccountBalance'])
            console.log(`Balance ${driver.FIO} - ${balanceUser}`)
            Disconnect();
            console.log(`Пользователь ${driver.FIO} зарегестрирован`);
        }
        BankGateway.disconnect();

        console.log(`DPS --------------------------------------------------------------`);
        // 50 токенов evaluateTransaction
        await Connect(ORG2, defaultDrivers[0].id);
        await getCONNECT_CONTRACT().submitTransaction('UpdateInfo', defaultDrivers[0].id, defaultDrivers[0].FIO, defaultDrivers[0].experience, 'DPS');
        // 50 токенов
        Disconnect();
        console.log(`Пользователь ${defaultDrivers[0].FIO} является сотрудником ДПС`);
        console.log(`\nMain End Контракт задеплоин, пользователи по умолчанию установлАены----------------------------------------------------------\n`);

    } catch (error) {
        console.error(`  Main error -- -- : ${error}`);
        if (error.stack) {
            console.error(error.stack);
        }
    }
}

module.exports = defaultParams;
