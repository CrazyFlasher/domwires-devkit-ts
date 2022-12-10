export interface IValidator<T = unknown>
{
    isValid(data?: T): boolean;
}