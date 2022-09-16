export const CONSTS = {
    CLI_COMMAND: "/cmd:",
    CLI_HELP: "/help"
};

export const DW_TYPES = {
    IInputView: "IInputView",
    IUIMediator: "IUIMediator",
    ILogger: "ILogger",
    ContextConfig: "ContextConfig",
    AppContextConfig: "AppContextConfig",
    IFactory: "IFactory",
    ICommandMapper: "ICommandMapper",
    ICommandMapperImmutable: "ICommandMapperImmutable",
    IFactoryImmutable: "IFactoryImmutable",
    ServiceConfig: "ServiceConfig",
    NetServerServiceConfig: "NetServerServiceConfig",
    NetClientServiceConfig: "NetClientServiceConfig",
    SocketServerServiceConfig: "SocketServerServiceConfig",
    DataBaseServiceConfig: "DataBaseServiceConfig",
    IHttpServerService: "IHttpServerService<HttpRequestResponseType>",
    ISocketServerService: "ISocketServerService<ClientDataType>",
    IDataBaseService: "IDataBaseService",
    INetClientService: "INetClientService",
    Class: "Class"
};

export const FACTORIES_NAMES = {
    CONTEXT: "contextFactory",
    MODEL: "modelFactory",
    MEDIATOR: "mediatorFactory",
    VIEW: "viewFactory"
};