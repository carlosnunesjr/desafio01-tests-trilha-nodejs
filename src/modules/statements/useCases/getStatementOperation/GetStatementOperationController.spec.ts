import request from 'supertest';

import createConnection from "../../../../database";
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import { User } from '../../../users/entities/User';
import { UsersRepository } from '../../../users/repositories/UsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';
import { StatementsRepository } from '../../repositories/StatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';

let connection: Connection;

let userAux: User;
let usersRepository: UsersRepository;
let createUserCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let statementsRepository: StatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Tests validation get balance by controller", () => {

    beforeAll(async () => {
        connection = await createConnection();

        usersRepository = new UsersRepository();
        createUserCase = new CreateUserUseCase(usersRepository);
        userAux = await createUserCase.execute({ name: "user name test", email: "usercreate@test.com", password: "xpto123" });

        authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

        statementsRepository = new StatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    });

    afterAll(async () => {
        await connection.query("delete from users");
    });

    it("should be able to get statement operation by controller", async () => {

        const { user, token } = await authenticateUserUseCase.execute({ email: userAux.email, password: "xpto123" });

        const statement = await createStatementUseCase.execute({ "user_id": user.id!, "type": OperationType.DEPOSIT, "amount": 99.99, "description": "statement test" });

        const response = await request(app).get(`/api/v1/statements/${statement.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body.amount).toEqual("99.99");
        expect(response.body.type).toEqual(OperationType.DEPOSIT);
    });
});