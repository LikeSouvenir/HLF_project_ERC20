'use strict';

const assetTransfer = require('./assetTransfer');
const erc20 = require('./tokenERC20')

module.exports.ERC20 = erc20;
module.exports.AssetTransfer = assetTransfer;
module.exports.contracts = [assetTransfer, erc20];
