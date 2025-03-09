'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const {Contract} = require('fabric-contract-api');
const TokenERC20Contract = require("./tokenERC20");


class AssetTransfer extends Contract {
    Token;

    async InitLedger(ctx) {
        const licenses = [
            {
                id: "000",
                temp: "11.01.2021",
                catigory: "A",
                userId: "NULL"
            },
            {
                id: "111",
                temp: "12.05.2025",
                catigory: "B",
                userId: "NULL"
            },
            {
                id: "222",
                temp: "09.09.2020",
                catigory: "C",
                userId: "NULL"
            },
            {
                id: "333",
                temp: "13.02.2027",
                catigory: "A",
                userId: "NULL"
            },
            {
                id: "444",
                temp: "10.09.2020",
                catigory: "B",
                userId: "NULL"
            },
            {
                id: "555",
                temp: "24.06.2029",
                catigory: "C",
                userId: "NULL"
            },
            {
                id: "666",
                temp: "31.03.30",
                userId: "NULL",
                catigory: "A"
            }
        ];
        for (const licens of licenses) {
            licens.docType = 'licens';
            await ctx.stub.putState(licens.id, Buffer.from(stringify(sortKeysRecursive(licens))));
        }
        this.Token = new TokenERC20Contract();
        console.log("Token - new")
    }

    //RegisterUser      1 work
    //UpdateInfo        1 work
    //AddCar            1 work
    //AddLicense        1 work
    //UpdateLicense     1 work
    //setSend           1 work
    //paySend           1 work

    async RegisterUser(ctx, id, FIO, experience) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`Пользователь с id ${id} уже есть`);
        }
        const user = {
            id: id,
            FIO: FIO,
            license: "NULL",
            experience: experience,
            countSends: [],
            cars: [],
            role: "driver"
        }
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(user))));
        return JSON.stringify(user);
    }

    async UpdateInfo(ctx, id, FIO, experience, role) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`Пользователь с id ${id} не найден`);
        }
        const userString = await this.ReadAsset(ctx, id);
        const oldUser = JSON.parse(userString);

        const user = {
            id: id,
            FIO: FIO,
            license: oldUser.license,
            experience: experience,
            countSends: oldUser.countSends,
            cars: oldUser.cars,
            role: role
        }
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(user))));
        return JSON.stringify(user);
    }

    async AddCar(ctx, id, category, cost, liveCycle) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`Пользователь с id ${id} не найден`);
        }
        const userString = await this.ReadAsset(ctx, id);
        const oldUser = JSON.parse(userString);

        if (oldUser.license === 'NULL') {
            throw new Error(`У пользователя с id ${id} нет лицензии`);
        }
        const licenseExists = await this.AssetExists(ctx, oldUser.license.id);
        if (!licenseExists) {
            throw new Error(`Лицензия у пользователя с id ${id} не найдена`);
        }
        const licenseString = await this.ReadAsset(ctx, oldUser.license.id);
        const license = JSON.parse(licenseString);

        if (license.catigory !== category) {
            throw new Error(`Категория у пользователя с id ${id} не совпадает с категорией лицензий авто`);
        }

        oldUser.cars.push({
            category: category,
            cost: cost,
            liveCycle: liveCycle,
        })
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(oldUser))));
        return JSON.stringify(oldUser);
    }

    async AddLicense(ctx, id, licenseId) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`Пользователь с id ${id} не найден`);
        }
        const userString = await this.ReadAsset(ctx, id);
        const oldUser = JSON.parse(userString);

        if (oldUser.license !== 'NULL') {
            throw new Error(`Лицензия у пользователя с id ${id} уже есть`);
        }
        const licenseExists = await this.AssetExists(ctx, licenseId);
        if (!licenseExists) {
            throw new Error(`Лицензия с id ${id} не найдена`);
        }
        const licenseString = await this.ReadAsset(ctx, licenseId);
        const license = JSON.parse(licenseString);

        if (license.userId !== 'NULL') {
            throw new Error(`Лицензия id ${licenseId} уже имеет пользователя`);
        }
        oldUser.license = license
        license.userId = id

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(oldUser))));
        await ctx.stub.putState(licenseId, Buffer.from(stringify(sortKeysRecursive(license))));
        return JSON.stringify(oldUser);
    }

    async UpdateLicense(ctx, id, licenseId, now) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`Пользователь с id ${id} не найден`);
        }
        const userString = await this.ReadAsset(ctx, id);
        const oldUser = JSON.parse(userString);

        if (oldUser.license === 'NULL') {
            throw new Error(`Лицензия у пользователя с id ${id} еще нет`);
        }

        const licenseExists = await this.AssetExists(ctx, licenseId);
        if (!licenseExists) {
            throw new Error(`Лицензия с id ${id} не найдена`);
        }
        const licenseString = await this.ReadAsset(ctx, licenseId);
        const license = JSON.parse(licenseString);

        if (license.userId !== 'NULL') {
            throw new Error(`Лицензия c id ${licenseId} уже имеет пользователя`);
        }
        const today = new Date(now)
        const arr = oldUser.license.temp.split('.')// "11.01.2021",
        const licenseTemp = new Date(Date.parse(`${arr[2]}.${arr[1]}.${arr[0]}`))
        const beetwen = new Date(licenseTemp - today);
        if (beetwen.getFullYear() < 1970 ||
            beetwen.getFullYear() === 1970 && beetwen.getMonth() < 2 ||
            beetwen.getMonth() === 2 && licenseTemp.getDate() - today.getDate() === 0) {

            oldUser.license = license
            license.userId = id
            await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(oldUser))));
            await ctx.stub.putState(licenseId, Buffer.from(stringify(sortKeysRecursive(license))));
            return JSON.stringify(oldUser);
        } else {
            throw new Error(`Лицензия c id ${licenseId} можно менять не ранее, чем за 2 месяца до даты окончания`);
        }
    }

    async setSends(ctx, id, date) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`Пользователь с id ${id} не найден`);
        }
        const userString = await this.ReadAsset(ctx, id);
        const oldUser = JSON.parse(userString);

        oldUser.countSends.push(date)

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(oldUser))));
        return JSON.stringify(oldUser);
    }

    async paySend(ctx, id, idxSend) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`Пользователь с id ${id} не найден`);
        }
        const userString = await this.ReadAsset(ctx, id);
        const oldUser = JSON.parse(userString);

        if (oldUser.countSends.length > 1) {
            oldUser.countSends[Number(idxSend)] = oldUser.countSends[oldUser.countSends.length - 1];
            oldUser.countSends.pop();
        } else {
            oldUser.countSends = [];
        }
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(oldUser))));
        return JSON.stringify(oldUser);
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    ///////////// -- ERC20 -- ////////////////////////// -- ERC20 -- ////////////////////////// -- ERC20 -- /////////////
    ERC20Function = {
        TokenName: (ctx) => this.Token.TokenName(ctx),
        Symbol: (ctx) => this.Token.Symbol(ctx),
        Decimals: (ctx) => this.Token.Decimals(ctx),
        Mint: (ctx, arg) => this.Token.Mint(ctx, arg),
        TotalSupply: (ctx) => this.Token.TotalSupply(ctx),
        BalanceOf: (ctx, owner) => this.Token.BalanceOf(ctx, owner),
        Transfer: (ctx, to, value) => this.Token.Transfer(ctx, to, value),
        TransferFrom: (ctx, from, to, value) => this.Token.TransferFrom(ctx, from, to, value),//
        _transfer: (ctx, from, to, value) => this.Token._transfer(ctx, from, to, value),
        Approve: (ctx, spender, value) => this.Token.Approve(ctx, spender, value),//
        Allowance: (ctx, owner, spender) => this.Token.Allowance(ctx, owner, spender),//
        ClientAccountBalance: (ctx) => this.Token.ClientAccountBalance(ctx),
        ClientAccountID: (ctx) => this.Token.ClientAccountID(ctx)
    }

    async runFuncERC20_2(name, args) {
        let [nameFunc, ...rest] = args.split(',');
        console.log(`runFuncERC20_2 `)
        console.log(`args - ${args}`)
        return await this.ERC20Function[nameFunc](name, ...rest);
    }

    async runFuncERC20_3(name, args) {
        console.log("name////////")
        let [nameFunc, ...rest] = args.split(',');
        console.log(`runFuncERC20_3 - ${nameFunc}`)
        console.log(`args - ${args}`)
        return await this.Token[nameFunc](name, ...rest);
    }

    // //////////////////////////////////

    async Initialize(ctx, name, symbol, decimals) {
        return this.Token.Initialize(ctx, name, symbol, decimals);
    }

    // async TokenName(ctx) {
    //     return this.Token.TokenName(ctx);
    // }
    //
    // async Symbol(ctx) {
    //     return this.Token.Symbol(ctx);
    // }
    //
    // async Decimals(ctx) {
    //     return this.Token.Decimals(ctx);
    // }
    //
    // async TotalSupply(ctx) {
    //     return this.Token.TotalSupply(ctx);
    // }
    //
    // async BalanceOf(ctx, owner) {
    //     return this.Token.BalanceOf(ctx, owner);
    // }
    //
    // async Transfer(ctx, to, value) {
    //     return this.Token.Transfer(ctx, to, value);
    // }
    //
    // async TransferFrom(ctx, from, to, value) {
    //     return this.Token.TransferFrom(ctx, from, to, value);
    // }
    //
    // async _transfer(ctx, from, to, value) {
    //     return this.Token._transfer(ctx, from, to, value);
    // }
    //
    // async Approve(ctx, spender, value) {
    //     return this.Token.Approve(ctx, spender, value);
    // }
    //
    // async Allowance(ctx, owner, spender) {
    //     return this.Token.Allowance(ctx, owner, spender);
    // }
    //
    //
    // async Mint(ctx, amount) {
    //     return this.Token.Mint(ctx, amount);
    // }
    //
    // async ClientAccountBalance(ctx) {
    //     return this.Token.ClientAccountBalance(ctx);
    // }
    //
    // async ClientAccountID(ctx) {
    //     return this.Token.ClientAccountID(ctx);
    // }
    //
    // add(a, b) {
    //     return this.Token.add(a, b);
    // }
    //
    // sub(a, b) {
    //     return this.Token.sub(a, b);
    // }

}

module.exports = AssetTransfer;
