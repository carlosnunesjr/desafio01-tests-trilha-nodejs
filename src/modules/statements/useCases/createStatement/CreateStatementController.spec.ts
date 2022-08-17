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

describe("Tests validation create statement by controller", () => {

    beforeAll(async () => {
        connection = await createConnection();

        usersRepository = new UsersRepository();
        createUserCase = new CreateUserUseCase(usersRepository);
        userAux = await createUserCase.execute({ name: "user name test", email: "usercreate@test.com", password: "xpto123" });

        authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    });

    afterAll(async () => {
        await connection.query("delete from users");
    });

    beforeEach(async () => {
        await connection.query("delete from statements");
    });

    it("should be able create a new deposit statement by controller", async () => {

        const { user, token } = await authenticateUserUseCase.execute({ email: userAux.email, password: "xpto123" });

        const response = await request(app).post("/api/v1/statements/deposit")
            .set("Authorization", `Bearer ${token}`)
            .send({ "amount": 100.23, "description": "test deposit" });

        expect(response.status).toBe(201);
        expect(response.body.description).toEqual("test deposit");
        expect(response.body.amount).toEqual(100.23);
        expect(response.body.type).toEqual("deposit");
    });

    it("should not be able create a new deposit statement with token invalid by controller", async () => {

        const response = await request(app).post("/api/v1/statements/deposit")
            .set("Authorization", "Bearer invalid token")
            .send({ "amount": 100.23, "description": "test deposit" });

        expect(response.status).toBe(401);
        expect(response.text).toEqual('{"message":"JWT invalid token!"}');
    });

    it("should not be able create a new deposit statement without token by controller", async () => {

        const response = await request(app).post("/api/v1/statements/deposit")
            .send({ "amount": 100.23, "description": "test deposit" });

        expect(response.status).toBe(401);
        expect(response.text).toEqual('{"message":"JWT token is missing!"}');
    });

    it("should be able create a new withdraw statement by controller", async () => {

        const { user, token } = await authenticateUserUseCase.execute({ email: userAux.email, password: "xpto123" });

        const responseDeposit = await request(app).post("/api/v1/statements/deposit")
            .set("Authorization", `Bearer ${token}`)
            .send({ "amount": 100.23, "description": "test deposit" });

        const response = await request(app).post("/api/v1/statements/withdraw")
            .set("Authorization", `Bearer ${token}`)
            .send({ "amount": 100.23, "description": "test withdraw" });

        expect(response.status).toBe(201);
        expect(response.body.description).toEqual("test withdraw");
        expect(response.body.amount).toEqual(100.23);
        expect(response.body.type).toEqual("withdraw");
    });

    it("should not be able create a new withdraw statement with insufficient funds by controller", async () => {

        const { user, token } = await authenticateUserUseCase.execute({ email: userAux.email, password: "xpto123" });

        const response = await request(app).post("/api/v1/statements/withdraw")
            .set("Authorization", `Bearer ${token}`)
            .send({ "amount": 100.23, "description": "test withdraw" });

        expect(response.status).toBe(400);
        expect(response.text).toEqual('{"message":"Insufficient funds"}');
    });

});