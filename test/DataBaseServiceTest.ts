import "reflect-metadata";
import {Done, Suite} from "mocha";
import {Enum, Factory, IFactory, Logger, LogLevel} from "domwires";
import {expect} from "chai";
import {
    DataBaseServiceConfig,
    DataBaseServiceMessageType,
    FilterOperator,
    IDataBaseService
} from "../src/com/domwires/devkit/server/common/service/net/db/IDataBaseService";
import {MongoDataBaseService} from "../src/com/domwires/devkit/server/common/service/net/db/impl/MongoDataBaseService";
import {Types} from "../src/com/domwires/devkit/common/Types";
import {NetServerServiceMessageType} from "../src/com/domwires/devkit/server/common/service/net/INetServerService";

class QueryId extends Enum
{
    public static readonly TEST_1:QueryId = new QueryId();
    public static readonly TEST_2:QueryId = new QueryId();
    public static readonly TEST_3:QueryId = new QueryId();
    public static readonly TEST_123:QueryId = new QueryId();
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
        factory = new Factory(new Logger(LogLevel.INFO));
        factory.mapToType<IDataBaseService>(Types.IDataBaseService, MongoDataBaseService);

        const config: DataBaseServiceConfig = {
            host: "127.0.0.1",
            port: 27017,
            dataBaseName: "test_data_base"
        };

        factory.mapToValue(Types.ServiceConfig, config);

        db = factory.getInstance(Types.IDataBaseService);

        const dropCollectionComplete = () =>
        {
            db.createCollection([
                {name: COLLECTION_NAME, uniqueIndexList: ["lastName"]},
                {name: "ololo", uniqueIndexList: ["puk"]},
            ]);
        };

        db.addMessageListener(NetServerServiceMessageType.OPEN_SUCCESS, () =>
        {
            expect(db.isOpened).true;

            db.dropCollection(COLLECTION_NAME);
        });

        db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_FAIL, dropCollectionComplete);
        db.addMessageListener(DataBaseServiceMessageType.DROP_COLLECTION_SUCCESS, dropCollectionComplete);

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

        db.addMessageListener<PermLiver[]>(DataBaseServiceMessageType.FIND_SUCCESS, () =>
        {
            const people = db.getFindResult<PermLiver[]>();

            expect(people && people.length).equals(1);
            expect(people && people[0].firstName).equals("Siplqy");

            update();
        }, true);

        // Find after update

        db.addMessageListener(DataBaseServiceMessageType.UPDATE_SUCCESS, () =>
        {
            // Delete

            db.addMessageListener<PermLiver[]>(DataBaseServiceMessageType.FIND_SUCCESS, () =>
            {
                const people = db.getFindResult<PermLiver[]>();

                expect(people && people[0].firstName).equals("Gidroponka");
                expect(people && people[0].lastName).equals("Nitokaja");

                deletePeople();
            }, true);

            findAfterUpdate();
        });

        // Find after delete

        db.addMessageListener(DataBaseServiceMessageType.DELETE_SUCCESS, () =>
        {
            expect(db.deleteResult).equals(1);

            db.addMessageListener<PermLiver[]>(DataBaseServiceMessageType.FIND_SUCCESS, () =>
            {
                const people = db.getFindResult<PermLiver[]>();

                expect(people && people.length).equals(2);

                done();
            }, true);

            findAfterDelete();
        });
    });

    it('testInsertFindUpdateDeleteWithAwait', async () =>
    {
        let people: PermLiver[];

        // Insert

        await insert();

        // Find

        await find();

        people = db.getFindResult<PermLiver[]>();

        expect(people && people.length).equals(1);
        expect(people && people[0].firstName).equals("Siplqy");

        // Update

        await update();

        // Find after update

        await findAfterUpdate();

        people = db.getFindResult<PermLiver[]>();

        expect(people && people[0].firstName).equals("Gidroponka");
        expect(people && people[0].lastName).equals("Nitokaja");

        // Delete

        await deletePeople();

        expect(db.deleteResult).equals(1);

        // Find after delete

        await findAfterDelete();

        people = db.getFindResult<PermLiver[]>();

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

        db.addMessageListener(DataBaseServiceMessageType.INSERT_SUCCESS, () =>
        {
            db.find<PermLiver>({id: QueryId.TEST_3}, COLLECTION_NAME, {lastName: "Sjavovna"}, 1);
            db.find<PermLiver>({id: QueryId.TEST_1}, COLLECTION_NAME, {lastName: "Hahalkin"}, 1);
            db.find<PermLiver>({id: QueryId.TEST_2}, COLLECTION_NAME, {lastName: "Hujznajet"}, 1);
        });

        db.addMessageListener(DataBaseServiceMessageType.FIND_SUCCESS, () =>
        {
            if (db.getFindResult<PermLiver[]>()[0].firstName === "Sjava")
            {
                expect(db.query?.id).equals(QueryId.TEST_1);

                tryToComplete();
            }
            else if (db.getFindResult<PermLiver[]>()[0].firstName === "Siplqy")
            {
                expect(db.query?.id).equals(QueryId.TEST_2);

                tryToComplete();
            }
            else if (db.getFindResult<PermLiver[]>()[0].firstName === "Gidroponka")
            {
                expect(db.query?.id).equals(QueryId.TEST_3);

                tryToComplete();
            }
        });
    });

    async function insert()
    {
        await db.insert<PermLiver>({id: QueryId.TEST_123}, COLLECTION_NAME, [
            {firstName: "Sjava", lastName: "Hahalkin", age: 39, male: true},
            {firstName: "Siplqy", lastName: "Hujznajet", age: 45, male: true},
            {firstName: "Gidroponka", lastName: "Sjavovna", age: 32, male: false},
        ]);
    }

    async function find()
    {
        await db.find<PermLiver>({id: QueryId.TEST_123}, COLLECTION_NAME, {age: {$greater: 35}}, 1, {
            field: "age",
            ascending: false
        });
    }

    async function update()
    {
        await db.update<PermLiver>(COLLECTION_NAME,
            {firstName: "Gidroponka"},
            {$set: {lastName: "Nitokaja"}});
    }

    async function findAfterUpdate()
    {
        await db.find<PermLiver>({id: QueryId.TEST_123}, COLLECTION_NAME, {firstName: "Gidroponka"});
    }

    async function deletePeople()
    {
        await db.delete<PermLiver>(COLLECTION_NAME, {firstName: {$regexMatch: "Sipl"}});
    }

    async function findAfterDelete()
    {
        await db.find<PermLiver>({id: QueryId.TEST_123}, COLLECTION_NAME, {});
    }
});

// }

type PermLiver = {
    readonly firstName?: string | FilterOperator;
    readonly lastName?: string | FilterOperator;
    readonly male?: boolean | FilterOperator;
    readonly age?: number | FilterOperator;
};