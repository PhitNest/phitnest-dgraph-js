import { PredicateMap } from "src";
import { fromPredicateMap } from "../src/util";
import {
    User,
    testGym,
    RegistrationStatus,
    getUserPredicateMap,
    testGymPredicateMap,
    Gym,
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

describe("fromPredicateMap", () => {
    const gymUid = "0x1";
    const userPredicateMap = getUserPredicateMap(gymUid);
    it("fromPredicateMap", () => {
        expect(fromPredicateMap(testGymPredicateMap)).toEqual(testGym);
        const userPredicateMapWithExtraGymData: PredicateMap<User> = {
            ...userPredicateMap,
            "User.gym": { uid: gymUid, "Gym.name": testGym.name },
        };
        const userWithExtraGymData: Omit<User, "gym"> & {
            gym: Partial<Gym> & { uid: string };
        } = {
            __typename: "User",
            firstName: userPredicateMapWithExtraGymData["User.firstName"],
            lastName: userPredicateMapWithExtraGymData["User.lastName"],
            id: userPredicateMapWithExtraGymData["User.id"],
            registrationStatus:
                userPredicateMapWithExtraGymData["User.registrationStatus"],
            createdAt: userPredicateMapWithExtraGymData["User.createdAt"],
            gym: { __typename: "Gym", uid: gymUid, name: testGym.name },
        };
        expect(fromPredicateMap(userPredicateMapWithExtraGymData)).toEqual(
            userWithExtraGymData,
        );
    });
});
