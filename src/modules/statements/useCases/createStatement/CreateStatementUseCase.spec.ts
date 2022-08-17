import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserCase: CreateUserUseCase;
let user: User;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Tests validation create statement case", () => {
    beforeEach(async () => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserCase = new CreateUserUseCase(inMemoryUsersRepository);
        user = await createUserCase.execute({ name: "user name test", email: "usercreate@test.com", password: "xpto123" });

        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    });

    it("should be able create a new statement", async () => {

        const statement = await createStatementUseCase.execute({ "user_id": user.id!, "type": OperationType.DEPOSIT, "amount": 99.99, "description": "statement test" });
        expect(statement).toHaveProperty("id");
    });

    it("should not be able create a new statment with a non-existent user", () => {

        expect(async () => {
            await createStatementUseCase.execute({ "user_id": "non-existent", "type": OperationType.DEPOSIT, "amount": 99.99, "description": "statement test" });
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);

    });

    it("should not be able create a new statment with a insufficient funds", () => {

        expect(async () => {
            await createStatementUseCase.execute({ "user_id": user.id!, "type": OperationType.DEPOSIT, "amount": 99.99, "description": "deposit statement test" });
            await createStatementUseCase.execute({ "user_id": user.id!, "type": OperationType.WITHDRAW, "amount": 100.00, "description": "withdraw statement test" });
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);

    });
});
