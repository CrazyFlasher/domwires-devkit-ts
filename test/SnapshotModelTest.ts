/* eslint-disable @typescript-eslint/no-empty-function */

import "reflect-metadata";
import {Suite} from "mocha";
import {expect} from "chai";
import {Factory, IFactory, Logger, LogLevel} from "domwires";
import {Types} from "../src/com/domwires/devkit/common/Types";
import {IAccountModel} from "../src/com/domwires/devkit/common/main/model/IAccountModel";
import {AccountDto} from "../src/com/domwires/devkit/common/net/Dto";

import "../src/com/domwires/devkit/common/main/model/IAccountModel";

describe('SnapshotModelTest', function (this: Suite)
{
    const f: IFactory = new Factory(new Logger(LogLevel.INFO));

    beforeEach(() =>
    {

    });

    afterEach(() =>
    {

    });

    it('testAutoMap', () =>
    {
        const model = f.getInstance<IAccountModel>(Types.IAccountModel);
        const dto: AccountDto = {email: "anton@javelin.ee", nick: "CrazyFlasher", password: "123qwe"};

        model.setSnapshot(dto);

        expect(model.nick).equals(dto.nick);
        expect(model.email).equals(dto.email);
        expect(model.password).equals(dto.password);

        const snapshot = model.snapshot;

        expect(snapshot.nick).equals(model.nick);
        expect(snapshot.email).equals(model.email);
        expect(snapshot.password).equals(model.password);
    });
});