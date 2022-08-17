import request from 'supertest';
import { app } from '../../../../app';

import createConnection from "../../../../database";
import { Connection } from 'typeorm';
import { User } from '../../entities/User';

import { UsersRepository } from '../../repositories/UsersRepository';
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from '../authenticateUser/AuthenticateUserUseCase';

let connection: Connection;

let userAux: User;
let usersRepository: UsersRepository;
let createUserCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Tests validation show user profile controller", () => {
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


    it("should be able get profile user by controller", async () => {

        const { user, token } = await authenticateUserUseCase.execute({ email: userAux.email, password: "xpto123" });

        const response = await request(app).get("/api/v1/profile")
            .set("Authorization", `Bearer ${token}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body.name).toEqual(userAux.name);
        expect(response.body.email).toEqual(userAux.email);
    });
});