import {IValidator} from "../../../common/IValidator";
import {AccountDto, LoginDto} from "../../../common/net/Dto";
import {DwError} from "../../../common/DwError";
import {ObjectId} from "bson";

export abstract class AbstractRequestValidator<TData> implements IValidator<TData>
{
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    public isValid(data?: TData): boolean
    {
        throw new Error(DwError.NOT_IMPLEMENTED.name);
    }

    protected isValidType<T>(orig: T, data: T): boolean
    {
        for (const key in data)
        {
            if (!(key in orig))
            {
                return false;
            }
        }

        return true;
    }

    protected isEmail(value: string): boolean
    {
        if (!this.exists(value))
        {
            return false;
        }

        return new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$").test(value);
    }

    protected exists(value: number | string | boolean | object | undefined): boolean
    {
        return value != undefined;
    }

    protected lengthAtLeast(value: string | undefined, length: number): boolean
    {
        if (!value) return false;

        return value.length >= length;
    }

    protected isPassword(value: string | undefined): boolean
    {
        if (!value) return false;

        return new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).test(value);
    }

    protected isNick(value: string | undefined): boolean
    {
        if (!value) return false;

        return this.lengthAtLeast(value, 3);
    }
}

export class EmptyRequestValidator extends AbstractRequestValidator<undefined> implements IValidator<undefined>
{
    public override isValid(data?: undefined): boolean
    {
        return !this.exists(data);
    }
}

export class RegisterValidator extends AbstractRequestValidator<AccountDto> implements IValidator<AccountDto>
{
    public override isValid(data: AccountDto): boolean
    {
        if (!this.isValidType<AccountDto>({email: "asd", password: "", _id: new ObjectId(), nick: ""}, data))
        {
            return false;
        }

        return this.isEmail(data.email) && this.isNick(data.nick) &&
            this.isPassword(data.password);
    }
}

export class LoginValidator extends AbstractRequestValidator<LoginDto> implements IValidator<LoginDto>
{
    public override isValid(data: LoginDto): boolean
    {
        if (!this.isValidType<LoginDto>({email: "asd", password: "", _id: new ObjectId()}, data))
        {
            return false;
        }

        return this.isEmail(data.email) && this.isPassword(data.password);
    }
}

export class ResetPasswordValidator extends AbstractRequestValidator<LoginDto> implements IValidator<LoginDto>
{
    public override isValid(data: LoginDto): boolean
    {
        if (!this.isValidType<LoginDto>({email: "asd", _id: new ObjectId()}, data))
        {
            return false;
        }

        return this.isEmail(data.email);
    }
}

export class TokenValidator extends AbstractRequestValidator<{ token: string }> implements IValidator<{ token: string }>
{
    public override isValid(data: { token: string }): boolean
    {
        try
        {
            new ObjectId(data.token);

            return true;
        } catch (e)
        {
            return false;
        }
    }
}

export class UpdatePasswordValidator extends AbstractRequestValidator<{ oldPassword: string; newPassword: string }>
    implements IValidator<{ oldPassword: string; newPassword: string }>
{
    public override isValid(data: { oldPassword: string; newPassword: string }): boolean
    {
        if (!this.isValidType<{ oldPassword: string; newPassword: string }>({oldPassword: "", newPassword: ""}, data))
        {
            return false;
        }

        return this.isPassword(data.oldPassword) && this.isPassword(data.newPassword);
    }
}

export class UpdateAccountDataValidator extends AbstractRequestValidator<{ nick: string }>
    implements IValidator<{ nick: string }>
{
    public override isValid(data: { nick: string }): boolean
    {
        if (!this.isValidType<{ nick: string }>({nick: ""}, data))
        {
            return false;
        }

        return this.isNick(data.nick);
    }
}

export class UpdateEmailValidator extends AbstractRequestValidator<{ email: string }>
    implements IValidator<{ email: string }>
{
    public override isValid(data: { email: string }): boolean
    {
        if (!this.isValidType<{ email: string }>({email: ""}, data))
        {
            return false;
        }

        return this.isEmail(data.email);
    }
}