import request from 'supertest';
import { app } from '../../../../app';

import { User } from "../../entities/User";
import { UsersRepository } from '../../repositories/UsersRepository';
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

import createConnection from "../../../../database";
import { Connection } from 'typeorm';

let usersRepository: UsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserCase: CreateUserUseCase;
let userAux: User;
let connection: Connection;

describe("Tests validation authenticate user controller", () => {

    beforeAll(async () => {
        connection = await createConnection();
    });

    beforeEach(async () => {
        usersRepository = new UsersRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
        createUserCase = new CreateUserUseCase(usersRepository);
        const userAlreadyExists = await usersRepository.findByEmail("usercreate@test.com");

        if (userAlreadyExists) {
            userAux = userAlreadyExists;
        } else {
            userAux = await createUserCase.execute({ name: "user name test", email: "usercreate@test.com", password: "xpto123" });
        }
    });

    it("shoud be able to authenticate a user by controller", async () => {
        const response = await request(app).post("/api/v1/sessions").send({ email: userAux.email, password: "xpto123" });
        expect(response.body).toHaveProperty("token");
        expect(response.status).toBe(200);
    });

    it("should not be able to authenticate with a wrong email by controller", async () => {

        const response = await request(app).post("/api/v1/sessions").send({ email: "wrong_email@test.com", password: "xpto123" });
        expect(response.body.message).toEqual("Incorrect email or password");
        expect(response.status).toBe(401);
    });

    it("should not be able to authenticate with a wrong password by controller", async () => {
        const response = await request(app).post("/api/v1/sessions").send({ email: userAux.email, password: "wrong_pass" });
        expect(response.body.message).toEqual("Incorrect email or password");
        expect(response.status).toBe(401);
    });
});