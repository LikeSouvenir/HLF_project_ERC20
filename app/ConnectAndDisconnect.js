const {initGatewayForOrg1, initGatewayForOrg2} = require("./InitGateway.js");
const {CHANNEL_NAME, CHAINCODE_NAME} = require("./Consts.js");
let {setCONNECT_CONTRACT, setUSER_ID, getUSER_ID} = require("./Consts.js");
let USER_GATEWAY;

async function Connect(org, id) {
    try {
        setUSER_ID(id)
        USER_GATEWAY = org.toLowerCase() === 'org1' || org.toLowerCase() === 'bank' ?
            await initGatewayForOrg1() : await initGatewayForOrg2();
        const networkOrg = await USER_GATEWAY.getNetwork(CHANNEL_NAME);
        setCONNECT_CONTRACT(networkOrg.getContract(CHAINCODE_NAME));
        console.log(`Пользователь ${getUSER_ID()} подключен, шлюз открыт`);
    } catch (error) {
        console.log(`Пользователь ${getUSER_ID()} не подключен, шлюз не открыт  - ERROR - ${error}`);
    }
}
function getGataway() {
    return USER_GATEWAY;
}

function Disconnect() {
    USER_GATEWAY.disconnect();
    setCONNECT_CONTRACT(undefined);
    console.log(`Пользователь ${getUSER_ID()} отключен, шлюз закрыт`);
    setUSER_ID(undefined);
}

module.exports = {Disconnect, Connect, getGataway};
