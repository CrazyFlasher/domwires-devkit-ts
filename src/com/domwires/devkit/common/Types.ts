export class Types
{
    public static readonly FactoriesConfig = "FactoriesConfig";

    public static readonly IAppContext = "IAppContext";
    public static readonly IAppContextImmutable = "IAppContextImmutable";

    public static readonly IServerAuthContext = "IServerAuthContext";
    public static readonly IServerAuthContextImmutable = "IServerAuthContextImmutable";

    public static readonly IClientAuthContext = "IClientAuthContext";
    public static readonly IClientAuthContextImmutable = "IAuthContextImmutable";

    public static readonly IServerMainContext = "IServerAppContext";
    public static readonly IServerMainContextImmutable = "IServerAppContextImmutable";

    public static readonly IClientMainContext = "IClientAppContext";
    public static readonly IClientMainContextImmutable = "IClientAppContextImmutable";

    public static readonly IAccountModel = "IAccountModel";
    public static readonly IAccountModelImmutable = "IAccountModelImmutable";

    public static readonly IAccountModelContainer = "IAccountModelContainer";
    public static readonly IAccountModelContainerImmutable = "IAccountModelContainerImmutable";

    public static readonly IInputView = "IInputView";
    public static readonly IUIMediator = "IUIMediator";
    public static readonly ILogger = "ILogger";
    public static readonly ContextConfig = "ContextConfig";

    public static readonly IFactory = "IFactory";
    public static readonly IFactoryImmutable = "IFactoryImmutable";

    public static readonly ICommandMapper = "ICommandMapper";
    public static readonly ICommandMapperImmutable = "ICommandMapperImmutable";

    public static readonly ServiceConfig = "ServiceConfig";
    public static readonly NetServerServiceConfig = "NetServerServiceConfig";
    public static readonly NetClientServiceConfig = "NetClientServiceConfig";
    public static readonly SocketServerServiceConfig = "SocketServerServiceConfig";
    public static readonly DataBaseServiceConfig = "DataBaseServiceConfig";

    public static readonly ExpressHttpServerService = "ExpressHttpServerService";
    public static readonly IHttpServerService = "IHttpServerService";
    public static readonly IHttpServerServiceImmutable = "IHttpServerServiceImmutable";

    public static readonly SioSocketServerService = "SioSocketServerService";
    public static readonly ISocketServerService = "ISocketServerService";
    public static readonly ISocketServerServiceImmutable = "ISocketServerServiceImmutable";

    public static readonly IDataBaseService = "IDataBaseService";
    public static readonly IDataBaseServiceImmutable = "IDataBaseServiceImmutable";

    public static readonly AuthMongoDataBaseService = "AuthMongoDataBaseService";
    public static readonly IAuthDataBaseService = "IAuthDataBaseService";
    public static readonly IAuthDataBaseServiceImmutable = "IAuthDataBaseServiceImmutable";

    public static readonly AxiosSioNetClientService = "AxiosSioNetClientService";
    public static readonly INetClientService = "INetClientService";
    public static readonly INetClientServiceImmutable = "INetClientServiceImmutable";

    public static readonly INetServerService = "INetServerService";
    public static readonly INetServerServiceImmutable = "INetServerServiceImmutable";

    public static readonly NodemailerEmailService = "NodemailerEmailService";
    public static readonly IEmailService = "IEmailService";
    public static readonly IEmailServiceImmutable = "IEmailServiceImmutable";

    public static readonly Class = "Class";

    public static readonly string = "string";
    public static readonly number = "number";
    public static readonly boolean = "boolean";
    public static readonly any = "any";
    public static readonly function = "Function";
    public static readonly object = "object";
    public static readonly empty = "";

    public static readonly SocketAction = "SocketAction";
    public static readonly HttpAction = "HttpAction";
    public static readonly ErrorReason = "ErrorReason";
}