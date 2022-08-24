import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserCase: CreateUserUseCase;
let user: User;
let statement: Statement;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Tests validation get statement operation case", () => {
    beforeEach(async () => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserCase = new CreateUserUseCase(inMemoryUsersRepository);
        user = await createUserCase.execute({ name: "user name test", email: "usercreate@test.com", password: "xpto123" });

        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        statement = await createStatementUseCase.execute({ "user_id": user.id!, "type": OperationType.DEPOSIT, "amount": 99.99, "description": "statement test", "sender_id": null });

        getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    });

    it("should be able to get statement operation", async () => {

        const operation = await getStatementOperationUseCase.execute({ "user_id": user.id!, "statement_id": statement.id! });
        expect(operation).toHaveProperty("id");
    });

    it("should not be able to get statement operation with a non-existent user", async () => {

        expect(async () => {
            await getStatementOperationUseCase.execute({ "user_id": "non-existent", "statement_id": statement.id! });
        }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
    });

    it("should not be able to get statement operation with a non-existent statement", async () => {

        expect(async () => {
            await getStatementOperationUseCase.execute({ "user_id": user.id!, "statement_id": "non-existent" });
        }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
    });
});