import request from 'supertest';
import { app } from '../../../../app';

import createConnection from "../../../../database";
import { Connection } from 'typeorm';

let connection: Connection;

describe("Tests validation create user by controller", () => {

    beforeAll(async () => {
        connection = await createConnection();
    });

    afterAll(async () => {
        await connection.query("delete from users");
    });

    it("should be able create a new user by controller", async () => {
        const dateNow = new Date();
        const response = await request(app).post("/api/v1/users").send({ name: "user name test", email: `usercreate${dateNow.getTime()}@test.com`, password: "xpto123" });

        expect(response.status).toBe(201);
    });

    it("should no be able to create a new user with an already existing email by controller", async () => {
        const dateNow = new Date();
        const time = dateNow.getTime();
        const response = await request(app).post("/api/v1/users").send({ name: "user name test", email: `usercreate${time}@test.com`, password: "xpto123" });
        expect(response.status).toBe(201);

        const response2 = await request(app).post("/api/v1/users").send({ name: "user name test", email: `usercreate${time}@test.com`, password: "xpto123" });
        expect(response2.body.message).toEqual("User already exists");
        expect(response2.status).toBe(400);
    });
});