import { SchemaType } from "src/types";
import { fromPredicateMap, toPredicateMap } from "src/util";
import {
    User,
    gymPredicateMap,
    testGym,
    getTestUser,
    RegistrationStatus,
    getUserPredicateMap,
} from "./helper";

describe("fromPredicateMap", () => {
    it("should throw for invalid points", async () => {
        let invalidPoint = {
            type: "Point",
            coordinates: [0, 0, 0],
        } as any;
        await expect(async () =>
            fromPredicateMap(invalidPoint),
        ).rejects.toThrowError("Invalid coordinates");
        invalidPoint = {
            type: "Point",
            coordinates: [0, 0],
            otherField: "hi",
        };
        await expect(async () =>
            fromPredicateMap(invalidPoint),
        ).rejects.toThrowError("Invalid point");
    });

    it("should throw for invalid typename", async () => {
        const invalidPredicateMap = {
            "User.firstName": "John",
            "User.lastName": "Doe",
            "User.id": "1",
            "User.registrationStatus": RegistrationStatus.Confirmed,
            "NotUser.createdAt": Date.now(),
        };
        await expect(async () =>
            fromPredicateMap(invalidPredicateMap),
        ).rejects.toThrowError("Invalid typename");
    });
});

describe("predicateMap roundtrip", () => {
    const gymUid = "0x1";
    const testUser: SchemaType<User, "gym"> = getTestUser(gymUid);
    const userPredicateMap = getUserPredicateMap(gymUid);
    it("toPredicateMap", () => {
        expect(toPredicateMap(testGym)).toEqual(gymPredicateMap);
        expect(toPredicateMap(testUser)).toEqual(userPredicateMap);
    });
    it("fromPredicateMap", () => {
        expect(fromPredicateMap(gymPredicateMap)).toEqual(testGym);
        const userPredicateMapWithExtraGymData = {
            ...userPredicateMap,
            "User.gym": { uid: gymUid, "Gym.name": testGym.name },
        };
        const userWithExtraGymData = {
            ...testUser,
            gym: { __typename: "Gym", uid: gymUid, name: testGym.name },
        };
        expect(fromPredicateMap(userPredicateMapWithExtraGymData)).toEqual(
            userWithExtraGymData,
        );
    });
});
