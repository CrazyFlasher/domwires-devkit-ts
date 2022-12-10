/* eslint-disable @typescript-eslint/no-empty-function */

import "reflect-metadata";
import {Suite} from "mocha";
import {expect} from "chai";
import {
    EmptyRequestValidator,
    LoginValidator,
    RegisterValidator
} from "../src/com/domwires/devkit/server/auth/context/RequestDataValidators";

describe('ValidatorsTest', function (this: Suite)
{
    beforeEach(() =>
    {

    });

    afterEach(() =>
    {

    });

    it('testRegisterValidator', () =>
    {
        const v = new RegisterValidator();

        expect(v.isValid({email: "anton@javelin.ee", password: "123qweASD", nick: "asd"})).true;
        expect(v.isValid({email: "anton@javelin.eeanton@javelin.ee", password: "123qweASD", nick: "asd"})).false;
        expect(v.isValid({email: "anton@javelin.ee", password: "123", nick: "asd"})).false;

        // Disabling for test purposes

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(v.isValid({email: "anton@javelin.ee", password: "123qwe", nick: "asd", opapa: "lol"})).false;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(v.isValid({email: "anton@javelin.eeanton@javelin.ee", nick: "asd"})).false;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(v.isValid({nick: "asd"})).false;
    });

    it('testLoginValidator', () =>
    {
        const v = new LoginValidator();

        expect(v.isValid({email: "anton@javelin.ee", password: "123qweASD"})).true;
        expect(v.isValid({email: "anton@javelin.eeanton@javelin.ee", password: "123qweASD"})).false;

        // Disabling for test purposes

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(v.isValid({email: "anton@javelin.ee", password: "123qweASD", nick: "asd"})).false;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(v.isValid({email: "anton@javelin.eeanton@javelin.ee", nick: "asd"})).false;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(v.isValid({nick: "asd"})).false;
    });

    it('testEmptyRequestValidator', () =>
    {
        const v = new EmptyRequestValidator();

        expect(v.isValid()).true;

        // Disabling for test purposes

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(v.isValid({email: "anton@javelin.eeanton@javelin.ee", nick: "asd"})).false;
    });
});