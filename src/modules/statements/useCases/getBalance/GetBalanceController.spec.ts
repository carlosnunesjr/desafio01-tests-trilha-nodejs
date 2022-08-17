import request from 'supertest';

import createConnection from "../../../../database";
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import { User } from '../../../users/entities/User';
import { UsersRepository } from '../../../users/repositories/UsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';

let connection: Connection;

let userAux: User;
let usersRepository: UsersRepository;
let createUserCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Tests validation get balance by controller", () => {

    beforeAll(async () => {
        connection = await createConnection();

        await connection.query("delete from users");

        usersRepository = new UsersRepository();
        createUserCase = new CreateUserUseCase(usersRepository);
        userAux = await createUserCase.execute({ name: "user name test", email: "usercreate@test.com", password: "xpto123" });

        authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    });

    afterAll(async () => {
        await connection.query("delete from users");
    });

    it("should be able to get balance by controller", async () => {

        const { user, token } = await authenticateUserUseCase.execute({ email: userAux.email, password: "xpto123" });

        const response = await request(app).get("/api/v1/statements/balance")
            .set("Authorization", `Bearer ${token}`)
            .send({ "amount": 100.23, "description": "test deposit" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("statement");
        expect(response.body).toHaveProperty("balance");

    });
});