const CHANNEL_NAME = 'blockchain2025';
const CHAINCODE_NAME = 'mycode';

const ORG1 = 'Bank';
const ORG2 = 'Users';
const defaultDrivers = [
    {
        id: "4",
        FIO: "Иванов Иван Иванович",
        experience: "2"
    },
    {
        id: "2",
        FIO: "Семенов Семен Семенович",
        experience: "5"
    },
    {
        id: "3",
        FIO: "Петров Петр Петрович",
        experience: "10"
    },
]

let USER_ID;
const setUSER_ID = (value) => USER_ID = value;
const getUSER_ID =  () => USER_ID;
let CONNECT_CONTRACT;
const setCONNECT_CONTRACT = (value) => CONNECT_CONTRACT = value;
const getCONNECT_CONTRACT =  () => CONNECT_CONTRACT;


module.exports = {
    ORG1,
    ORG2,
    CHANNEL_NAME,
    CHAINCODE_NAME,
    defaultDrivers,
    setUSER_ID,
    getUSER_ID,
    setCONNECT_CONTRACT,
    getCONNECT_CONTRACT,
}
