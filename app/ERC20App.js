const {Connect, Disconnect} = require("./ConnectAndDisconnect");
const {ORG1, getCONNECT_CONTRACT, ORG2} = require("./Consts");

async function ERC20App() {
    const userId = '1115'
    await Connect(ORG2, userId);
    const IDUser = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['ClientAccountID'])
    Disconnect();

    console.log("TestERC20 Start -----------------------------------------------------------------------");
    await Connect(ORG1, 'Bank');
    const IDBank = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['ClientAccountID'])
    try {
        await getCONNECT_CONTRACT().submitTransaction('runFuncERC20_2', ['Mint', '2020']);
        console.log(`Bank -- Mint\n`)
    } catch (err) {
        console.log(`Bank -- Mint errOR - ${err}\n`)
    }
    try {
        await getCONNECT_CONTRACT().submitTransaction('runFuncERC20_2', ['Transfer', IDUser, '1001']);
        const balance = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['BalanceOf', IDUser]);
        console.log(`Bank -- Transfer - new Balance - ${balance}\n`)
    } catch (err) {
        console.log(`Bank -- Transfer errOR - ${err}\n`)
    }
    Disconnect();
    // Users try test func
    await Connect(ORG2, userId);
    try {
        const name = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['TokenName']);
        const Symbol = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['Symbol']);
        const Decimals = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['Decimals']);
        const TotalSupply = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['TotalSupply']);
        console.log(`User ${userId} -- TokenName - ${name}\n`)
        console.log(`User ${userId} -- Symbol - ${Symbol}\n`)
        console.log(`User ${userId} -- Decimals - ${Decimals}\n`)
        console.log(`User ${userId} -- TotalSupply - ${TotalSupply}\n`)
    } catch (err) {
        console.log(`User ${userId} -- TokenName errOR - ${err}\n`)
    }
    try {
        let balance = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['ClientAccountBalance']);
        console.log(`User ${userId} -- ClientAccountBalance - ${balance}\n`)
        await getCONNECT_CONTRACT().submitTransaction('runFuncERC20_2', ['_transfer', IDUser, IDBank, "100"]);
        balance = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['ClientAccountBalance']);
        console.log(`User ${userId} -- ClientAccountBalance - ${balance}\n`)
    } catch (err) {
        console.log(`User ${userId} -- ClientAccountBalance errOR - ${err}\n`)
    }
    try {
        let balance = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['ClientAccountBalance']);
        console.log(`User ${userId} -- ClientAccountBalance -(['_transfer', IDBank, IDUser, "115"])) -  ${balance}\n`)
        await getCONNECT_CONTRACT().submitTransaction('runFuncERC20_2', ['_transfer', IDBank, IDUser, "115"]);
        balance = await getCONNECT_CONTRACT().evaluateTransaction('runFuncERC20_2', ['ClientAccountBalance']);
        console.log(`User ${userId} -- ClientAccountBalance -(['_transfer', IDBank, IDUser, "115"])) -  ${balance}\n`)
    } catch (err) {
        console.log(`User ${userId} -- ClientAccountBalance errOR (['_transfer', IDBank, IDUser, "115"])) - ${err}\n`)
    }
    Disconnect();

    // TokenName: (ctx) => this.Token.TokenName(ctx),                                       1
    // Symbol: (ctx) => this.Token.Symbol(ctx),                                             1
    // Decimals: (ctx) => this.Token.Decimals(ctx),                                         1
    // Mint: (ctx, arg) => this.Token.Mint(ctx, arg),                                       1
    // TotalSupply: (ctx) => this.Token.TotalSupply(ctx),                                   1
    // BalanceOf: (ctx, owner) => this.Token.BalanceOf(ctx, owner),                         1
    // Transfer: (ctx, to, value) => this.Token.Transfer(ctx, to, value),                   1
    // _transfer: (ctx, from, to, value) => this.Token._transfer(ctx, from, to, value),     1
    // ClientAccountBalance: (ctx) => this.Token.ClientAccountBalance(ctx),                 1
    // ClientAccountID: (ctx) => this.Token.ClientAccountID(ctx)                            1
    console.log("TestERC20 End  ---------------------------------------------------------------------------");
}

module.exports = ERC20App;
