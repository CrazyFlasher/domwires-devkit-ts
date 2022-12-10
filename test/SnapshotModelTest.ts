/* eslint-disable @typescript-eslint/no-empty-function */

import "reflect-metadata";
import {Suite} from "mocha";
import {expect} from "chai";
import {Factory, IFactory, Logger, LogLevel} from "domwires";
import {Types} from "../src/com/domwires/devkit/common/Types";
import {IAccountModel} from "../src/com/domwires/devkit/common/main/model/IAccountModel";
import {AccountDto} from "../src/com/domwires/devkit/common/net/Dto";

import "../src/com/domwires/devkit/common/main/model/IAccountModel";
import {SnapshotModel} from "../src/com/domwires/devkit/common/main/model/ISnapshotModel";
import {snapshotValue} from "../src/com/domwires/devkit/common/Decorators";

describe('SnapshotModelTest', function (this: Suite)
{
    const f: IFactory = new Factory(new Logger(LogLevel.VERBOSE));

    beforeEach(() =>
    {

    });

    afterEach(() =>
    {

    });

    it('testAutoMapAndClear', () =>
    {
        const model = f.getInstance<IAccountModel>(Types.IAccountModel);
        const dto: AccountDto = {email: "anton@javelin.ee", nick: "CrazyFlasher", password: "123qwe"};

        model.setSnapshot(dto);

        expect(model.nick).equals(dto.nick);
        expect(model.email).equals(dto.email);

        const snapshot = model.snapshot;

        expect(snapshot.nick).equals(model.nick);
        expect(snapshot.email).equals(model.email);

        model.clearSnapshotValues();

        expect(model.nick).undefined;
        expect(model.email).undefined;
    });

    it('testDoNotClearMissingValues', () =>
    {
        class Model extends SnapshotModel<{first?: string; last?: string}>
        {
            @snapshotValue()
            private _first!: string;

            @snapshotValue()
            private _last!: string;

            public get last(): string
            {
                return this._last;
            }

            public get first(): string
            {
                return this._first;
            }
        }

        const model = f.getInstance<Model>(Model);
        model.setSnapshot({first: "Anton", last: "Nefjodov"});

        expect(model.first).equals("Anton");
        expect(model.last).equals("Nefjodov");

        model.setSnapshot({first: "Huju"});

        expect(model.first).equals("Huju");
        expect(model.last).equals("Nefjodov");
    });
});