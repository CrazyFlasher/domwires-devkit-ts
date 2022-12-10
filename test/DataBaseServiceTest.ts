import "reflect-metadata";
import {Done, Suite} from "mocha";
import {Enum, Factory, IFactory, Logger, LogLevel} from "domwires";
import {expect} from "chai";
import {
    DataBaseErrorReason,
    DataBaseServiceConfig,
    DataBaseServiceMessageType,
    FilterOperator,
    IDataBaseService,
    Query
} from "../src/com/domwires/devkit/server/common/service/net/db/IDataBaseService";
import {MongoDataBaseService} from "../src/com/domwires/devkit/server/common/service/net/db/impl/MongoDataBaseService";
import {Types} from "../src/com/domwires/devkit/common/Types";
import {NetServerServiceMessageType} from "../src/com/domwires/devkit/server/common/service/net/INetServerService";

class QueryId extends Enum
{
    public static readonly TEST_1: QueryId = new QueryId();
    public static readonly TEST_2: QueryId = new QueryId();
    public static readonly TEST_3: QueryId = new QueryId();
    public static readonly TEST_123: QueryId = new QueryId();
}

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
        factory = new Factory(new Logger(LogLevel.VERBOSE));
        factory.mapToType<IDataBaseService>(Types.IDataBaseService, MongoDataBaseService);

        const config: DataBaseServiceConfig = {
            host: "127.0.0.1",
            port: 27017,
            dataBaseName: "test_data_base"
        };

        factory.mapToValue(Types.ServiceConfig, config);

        db = factory.getInstance(Types.IDataBaseService);

        const dropCollectionComplete_2 = () =>
        {
            db.createCollection([
                {name: COLLECTION_NAME, uniqueIndexList: ["lastName"]},
                {name: "ololo", uniqueIndexList: ["puk"]},
            ]);
        };

        const dropCollectionComplete_1 = () =>
        {
            db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_FAIL, dropCollectionComplete_2, true);
            db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_SUCCESS, dropCollectionComplete_2, true);

            db.dropCollection("ololo");
        };

        db.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            expect(db.isOpened).true;

            db.dropCollection(COLLECTION_NAME);
        });

        db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_FAIL, dropCollectionComplete_1, true);
        db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_SUCCESS, dropCollectionComplete_1, true);

        db.addMessageListener(DataBaseServiceMessageType.CREATE_COLLECTION_LIST_COMPLETE, () =>
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

        db.addMessageListener(NetServerServiceMessageType.CLOSE_SUCCESS, complete);

        if (db.isOpened)
        {
            db.close();
        }
        else
        {
            complete();
        }
    });

    it('testInsertFindUpdateDeleteWithListeners', (done: Done) =>
    {
        //Insert

        insert();

        //Find

        db.addMessageListener(DataBaseServiceMessageType.INSERT_SUCCESS, find, true);

        // Update

        db.addMessageListener<{ query: Query; result: PermLiver[] }>(DataBaseServiceMessageType.FIND_SUCCESS, (message, data) =>
        {
            const people = data!.result;

            expect(people && people.length).equals(1);
            expect(people && people[0].firstName).equals("Siplqy");

            update();
        }, true);

        // Find after update

        db.addMessageListener(DataBaseServiceMessageType.UPDATE_SUCCESS, () =>
        {
            // Delete

            db.addMessageListener<{ query: Query; result: PermLiver[] }>(DataBaseServiceMessageType.FIND_SUCCESS, (message, data) =>
            {
                const people = data!.result;

                expect(people && people[0].firstName).equals("Gidroponka");
                expect(people && people[0].lastName).equals("Nitokaja");

                deletePeople();
            }, true);

            findAfterUpdate();
        });

        // Find after delete

        db.addMessageListener<{ query: Query; result: number }>(DataBaseServiceMessageType.DELETE_SUCCESS, (message, data) =>
        {
            expect(data!.result).equals(1);

            db.addMessageListener<{ query: Query; result: PermLiver[] }>(DataBaseServiceMessageType.FIND_SUCCESS, (message, data) =>
            {
                const people = data!.result;

                expect(people && people.length).equals(2);

                done();
            }, true);

            findAfterDelete();
        });
    });

    it('testInsertFindUpdateDeleteWithAwait', async () =>
    {
        let people: PermLiver[] | undefined;

        // Insert

        await insert();

        // Find

        let findResult = await find();

        expect(findResult).not.undefined;

        if (findResult)
        {
            expect(findResult.query!.id).equals(QueryId.TEST_123);
            expect(findResult.result && findResult.result[0].firstName).equals("Siplqy");
        }

        // Update

        const updateResult = await update();

        expect(updateResult).not.undefined;

        if (updateResult) expect(updateResult.result).true;

        // Find after update

        findResult = await findAfterUpdate();

        expect(findResult).not.undefined;

        if (findResult) people = findResult.result;

        expect(people && people[0].firstName).equals("Gidroponka");
        expect(people && people[0].lastName).equals("Nitokaja");

        // Delete

        const deleteResult = await deletePeople();

        expect(deleteResult!.result).equals(1);

        // Find after delete

        findResult = await findAfterDelete();

        expect(findResult).not.undefined;

        if (findResult) people = findResult.result;

        expect(people && people.length).equals(2);
    });

    it('testFindAndCheckQueryId', (done) =>
    {
        let findResponseCount = 0;

        const tryToComplete = () =>
        {
            findResponseCount++;

            if (findResponseCount === 3)
            {
                done();
            }
        };

        insert();

        type SomeData = {
            readonly olo: string;
        };

        db.addMessageListener(DataBaseServiceMessageType.INSERT_SUCCESS, () =>
        {
            db.find<PermLiver, PermLiver, SomeData>(COLLECTION_NAME, {lastName: "Sjavovna"}, undefined, {
                id: QueryId.TEST_3,
                data: {olo: "puk"}
            }, 1);
            db.find<PermLiver>(COLLECTION_NAME, {lastName: "Hahalkin"}, undefined, {id: QueryId.TEST_1}, 1);
            db.find<PermLiver>(COLLECTION_NAME, {lastName: "Hujznajet"}, undefined, {id: QueryId.TEST_2}, 1);
        });

        db.addMessageListener<{ query: Query<SomeData>; result: PermLiver[]; errorReason: DataBaseErrorReason }>
        (DataBaseServiceMessageType.FIND_SUCCESS, (message, data) =>
        {
            if (data!.result[0].firstName === "Sjava")
            {
                expect(data!.query.id).equals(QueryId.TEST_1);

                tryToComplete();
            }
            else if (data!.result[0].firstName === "Siplqy")
            {
                expect(data!.query.id).equals(QueryId.TEST_2);

                tryToComplete();
            }
            else if (data!.result[0].firstName === "Gidroponka")
            {
                expect(data!.query.id).equals(QueryId.TEST_3);
                expect(data!.query.data!.olo).equals("puk");

                tryToComplete();
            }
        });
    });

    async function insert()
    {
        return await db.insert<PermLiver>(COLLECTION_NAME, [
            {firstName: "Sjava", lastName: "Hahalkin", age: 39, male: true},
            {firstName: "Siplqy", lastName: "Hujznajet", age: 45, male: true},
            {firstName: "Gidroponka", lastName: "Sjavovna", age: 32, male: false}
        ], {id: QueryId.TEST_123});
    }

    async function find()
    {
        return await db.find<PermLiver>(COLLECTION_NAME, {age: {$greater: 35}}, undefined, {id: QueryId.TEST_123}, 1, {
            field: "age",
            ascending: false
        });
    }

    async function update()
    {
        return await db.update<PermLiver>(COLLECTION_NAME,
            {firstName: "Gidroponka"}, {$set: {lastName: "Nitokaja"}}, {id: QueryId.TEST_1});
    }

    async function findAfterUpdate()
    {
        return await db.find<PermLiver>(COLLECTION_NAME, {firstName: "Gidroponka"}, undefined, {id: QueryId.TEST_123});
    }

    async function deletePeople()
    {
        return await db.delete<PermLiver>(COLLECTION_NAME, {firstName: {$regexMatch: "Sipl"}}, {id: QueryId.TEST_1});
    }

    async function findAfterDelete()
    {
        return await db.find<PermLiver>(COLLECTION_NAME, {}, undefined, {id: QueryId.TEST_123});
    }
});

// }

type PermLiver = {
    readonly firstName?: string | FilterOperator;
    readonly lastName?: string | FilterOperator;
    readonly male?: boolean | FilterOperator;
    readonly age?: number | FilterOperator;
};