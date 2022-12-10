import "reflect-metadata";
import {Done, Suite} from "mocha";
import {expect} from "chai";
import {Factory, IFactory, Logger, LogLevel, setDefaultImplementation} from "domwires";
import {GameObject} from "./mock/typesForModels/GameObject";
import {
    GameObjectComponent,
    GameObjectComponentMessageType,
    IGameObjectComponent
} from "./mock/typesForModels/gameObject/IGameObjectComponent";
import {Building} from "./mock/typesForModels/Building";
import {BuildingComponent, IBuildingComponent} from "./mock/typesForModels/building/IBuildingComponent";
import {CrazyFormat1} from "./mock/typesForModels/CrazyFormat1";
import {CrazyFormat1Component, ICrazyFormat1Component} from "./mock/typesForModels/crazyFormat1/ICrazyFormat1Component";

setDefaultImplementation<IGameObjectComponent>("IGameObjectComponent", GameObjectComponent);
setDefaultImplementation<IBuildingComponent>("IBuildingComponent", BuildingComponent);
setDefaultImplementation<ICrazyFormat1Component>("ICrazyFormat1Component", CrazyFormat1Component);

describe('ModelFromTypeDefTest', function (this: Suite)
{
    let factory: IFactory;

    beforeEach(() =>
    {
        factory = new Factory(new Logger(LogLevel.VERBOSE));
    });

    afterEach(() =>
    {
        factory.dispose();
    });

    it('testBaseTypeDef', () =>
    {
        const id = "some_object_1";
        const name = "cool_game_object";

        const data: GameObject = {id: id, name: name};
        factory.mapToValue("GameObject", data);

        const model: IGameObjectComponent = factory.getInstance("IGameObjectComponent");

        expect(id).equals(model.id);
        expect(name).equals(model.name);

        model.setId("go").setName("ololo");

        expect("go").equals(model.id);
        expect("ololo").equals(model.name);
    });

    it('testExtendedTypeDef', () =>
    {
        const id = "some_object_1";
        const name = "cool_game_object";
        const creationTime = 12345;
        const maxUnits = 4;

        const data: Building = {
            id: id,
            name: name,
            creationTime: creationTime,
            maxUnits: maxUnits
        };

        factory.mapToValue("GameObject", data);
        factory.mapToValue("Building", data);

        const model: IBuildingComponent = factory.getInstance("IBuildingComponent");

        expect(id).equals(model.id);
        expect(name).equals(model.name);
        expect(creationTime).equals(model.creationTime);
        expect(maxUnits).equals(model.maxUnits);

        model.setId("go").setName("ololo");
        model.setCreationTime(1).setMaxUnits(2);

        expect("go").equals(model.id);
        expect("ololo").equals(model.name);
        expect(1).equals(model.creationTime);
        expect(2).equals(model.maxUnits);
    });

    it('testTypeDefMessage', (done: Done) =>
    {
        const data: GameObject = {id: "id", name: "name"};
        factory.mapToValue("GameObject", data);

        const model: IGameObjectComponent = factory.getInstance("IGameObjectComponent");
        model.addMessageListener(GameObjectComponentMessageType.ON_SET_ID, () =>
        {
            done();
        });
        model.dispatchMessage(GameObjectComponentMessageType.ON_SET_ID);
    });

    it('testUglyTypeDef', () =>
    {
        const data: CrazyFormat1 = {
            a: 1,
            b: "two",
            id: "id",
            name: "name",
            maxUnits: 5,
            creationTime: 1000
        };
        factory.mapToValue("GameObject", data);
        factory.mapToValue("Building", data);
        factory.mapToValue("CrazyFormat1", data);

        const model: ICrazyFormat1Component = factory.getInstance("ICrazyFormat1Component");

        expect(1).equals(model.a);
        expect("two").equals(model.b);
    });
});