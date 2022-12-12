/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import {ClientExistsGuards} from "./ClientExistsGuards";

export class ClientNotExistGuards extends ClientExistsGuards
{
    public override get allows(): boolean
    {
        return !super.allows;
    }

    protected override printLog(allows: boolean): void
    {

    }
}