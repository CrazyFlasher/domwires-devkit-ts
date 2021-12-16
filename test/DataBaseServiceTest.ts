import "reflect-metadata";
import {Done, Suite} from "mocha";
import {Factory, IFactory, IMessage} from "domwires";
import {DW_TYPES} from "../src/com/domwires/devkit/dw_consts";
import {expect} from "chai";
import {
    DataBaseServiceConfig,
    DataBaseServiceMessageType,
    FilterOperator,
    IDataBaseService
} from "../src/com/domwires/devkit/service/net/db/IDataBaseService";
import {MongoDataBaseService} from "../src/com/domwires/devkit/service/net/db/impl/MongoDataBaseService";

/*describe('SioSocketServerServiceTest', function (this: Suite)
{
    run(SioSocketServerService);
});*/

// function run(implementationClass: Class<ISocketServerService>): void
// {
describe('DataBaseServiceTest', function (this: Suite)
{
    let factory: IFactory;
    let db: IDataBaseService;
    const COLLECTION_NAME = "testCollection";

    beforeEach((done: Done) =>
    {
        factory = new Factory();
        factory.mapToType(DW_TYPES.IDataBaseService, MongoDataBaseService);

        const config: DataBaseServiceConfig = {uri: "mongodb://127.0.0.1:27017", dataBaseName: "test_data_base"};

        factory.mapToValue(DW_TYPES.SocketServerServiceConfig, config);
        factory.mapToValue(DW_TYPES.DataBaseServiceConfig, config);
        factory.mapToValue(DW_TYPES.ServiceConfig, config);

        db = factory.getInstance(DW_TYPES.IDataBaseService);

        const dropCollectionComplete = () =>
        {
            db.createCollection(COLLECTION_NAME, ["lastName"]);
        };

        db.addMessageListener(DataBaseServiceMessageType.CONNECT_SUCCESS, () =>
        {
            expect(db.isConnected).true;

            db.dropCollection(COLLECTION_NAME);
        });

        db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_FAIL, dropCollectionComplete);
        db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_SUCCESS, dropCollectionComplete);

        db.addMessageListener(DataBaseServiceMessageType.CREATE_COLLECTION_SUCCESS, () =>
        {
            done();
        });

        // We suppose that collection already exists
        db.addMessageListener(DataBaseServiceMessageType.CREATE_COLLECTION_FAIL, () =>
        {
            done();
        });

        db.init();
    });

    afterEach((done: Done) =>
    {
        const complete = () =>
        {
            db.dispose();
            factory.dispose();

            done();
        };

        db.addMessageListener(DataBaseServiceMessageType.DISCONNECT_SUCCESS, complete);

        if (db.isConnected)
        {
            db.disconnect();
        }
        else
        {
            complete();
        }
    });

    it('testInsertFindUpdateDelete', (done: Done) =>
    {
        const complete = () =>
        {
            done();
        };

        const findSuccess_1 = (m: IMessage, people: PermLiver[]) =>
        {
            expect(people.length).equals(1);
            expect(people[0].firstName).equals("Siplqy");

            db.update<PermLiver>(COLLECTION_NAME,
                {firstName: "Gidroponka"},
                {$set: {lastName: "Nitokaja"}});
        };

        const findSuccess_2 = (m: IMessage, people: PermLiver[]) =>
        {
            expect(people[0].firstName).equals("Gidroponka");
            expect(people[0].lastName).equals("Nitokaja");

            db.delete<PermLiver>(COLLECTION_NAME, {firstName: {$regexMatch: "Sipl"}});
        };

        const findSuccess_3 = (m: IMessage, people: PermLiver[]) =>
        {
            expect(people.length).equals(2);

            complete();
        };

        db.addMessageListener(DataBaseServiceMessageType.INSERT_SUCCESS, () =>
        {
            db.find<PermLiver>(COLLECTION_NAME, {age: {$greater: 35}}, 1, {field: "age", ascending: false});
        });

        db.addMessageListener<PermLiver[]>(DataBaseServiceMessageType.FIND_SUCCESS, findSuccess_1);

        db.addMessageListener(DataBaseServiceMessageType.UPDATE_SUCCESS, () =>
        {
            db.removeMessageListener<PermLiver[]>(DataBaseServiceMessageType.FIND_SUCCESS, findSuccess_1);
            db.addMessageListener<PermLiver[]>(DataBaseServiceMessageType.FIND_SUCCESS, findSuccess_2);

            db.find<PermLiver>(COLLECTION_NAME, {firstName: "Gidroponka"});
        });

        db.addMessageListener(DataBaseServiceMessageType.DELETE_SUCCESS, (m: IMessage, deletedCount) =>
        {
            expect(deletedCount).equals(1);

            db.removeMessageListener<PermLiver[]>(DataBaseServiceMessageType.FIND_SUCCESS, findSuccess_2);
            db.addMessageListener<PermLiver[]>(DataBaseServiceMessageType.FIND_SUCCESS, findSuccess_3);

            db.find<PermLiver>(COLLECTION_NAME, {});
        });

        db.insert<PermLiver>(COLLECTION_NAME, [
            {firstName: "Sjava", lastName: "Hahalkin", age: 39, male: true},
            {firstName: "Siplqy", lastName: "Hujznajet", age: 45, male: true},
            {firstName: "Gidroponka", lastName: "Sjavovna", age: 32, male: false},
        ]);
    });

});

// }

type PermLiver = {
    readonly firstName?: string | FilterOperator;
    readonly lastName?: string | FilterOperator;
    readonly male?: boolean | FilterOperator;
    readonly age?: number | FilterOperator;
};