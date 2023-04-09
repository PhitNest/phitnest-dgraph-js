import * as dgraph from "../src";

export const SERVER_ADDR = "http://localhost:8080"; // tslint:disable-line no-http-string
export const USE_LEGACY_API = false;

export function createClient(): dgraph.DgraphClient {
    return new dgraph.DgraphClient(
        new dgraph.DgraphClientStub(SERVER_ADDR, { legacyApi: USE_LEGACY_API }),
    );
}

export function setSchema(
    c: dgraph.DgraphClient,
    schema: string,
): Promise<dgraph.Payload> {
    return c.alter({ schema });
}

export function dropAll(c: dgraph.DgraphClient): Promise<dgraph.Payload> {
    return c.alter({ dropAll: true });
}

export async function setup(
    userid?: string,
    password?: string,
): Promise<dgraph.DgraphClient> {
    const c = createClient();
    if (!USE_LEGACY_API) {
        if (userid === undefined) {
            await c.login("groot", "password");
        } else {
            await c.login(userid, password);
        }
    }
    await dropAll(c);
    return c;
}

export function wait(time: number): Promise<void> {
    return new Promise(
        // @ts-ignore
        (resolve: () => void): void => setTimeout(resolve, time),
    );
}

export type Gym = {
    __typename: "Gym" | undefined;
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    location: {
        __typename: "Point" | undefined;
        latitude: number;
        longitude: number;
    };
};

export const testGym: Gym = {
    __typename: "Gym",
    name: "Planet Fitness",
    street: "123 Main St",
    city: "Anytown",
    state: "NY",
    zipCode: "12345",
    location: {
        __typename: "Point",
        latitude: 40.123,
        longitude: -73.456,
    },
};

export const testGymPredicateMap: dgraph.PredicateMap<Gym> = {
    "Gym.name": testGym.name,
    "Gym.street": testGym.street,
    "Gym.city": testGym.city,
    "Gym.state": testGym.state,
    "Gym.zipCode": testGym.zipCode,
    "Gym.location": {
        type: "Point",
        coordinates: [testGym.location.longitude, testGym.location.latitude],
    },
};

export enum RegistrationStatus {
    Unconfirmed = "Unconfirmed",
    Confirmed = "Confirmed",
}

export type User = {
    __typename: "User" | undefined;
    firstName: string;
    lastName: string;
    id: string;
    registrationStatus: RegistrationStatus;
    createdAt: number;
    gym: Gym;
};

export function getUserPredicateMap(gymUid: string): dgraph.PredicateMap<User> {
    return {
        "User.firstName": "John",
        "User.lastName": "Doe",
        "User.id": "1",
        "User.registrationStatus": RegistrationStatus.Unconfirmed,
        "User.createdAt": Date.now(),
        "User.gym": {
            uid: gymUid,
        },
    };
}
