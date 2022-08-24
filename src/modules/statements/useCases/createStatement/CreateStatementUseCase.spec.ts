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
    TRANSFER = 'transfer'
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

        const statement = await createStatementUseCase.execute({ "user_id": user.id!, "type": OperationType.DEPOSIT, "amount": 99.99, "description": "statement test", "sender_id": null });
        expect(statement).toHaveProperty("id");
    });

    it("should not be able create a new statment with a non-existent user", () => {

        expect(async () => {
            await createStatementUseCase.execute({ "user_id": "non-existent", "type": OperationType.DEPOSIT, "amount": 99.99, "description": "statement test", "sender_id": null });
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);

    });

    it("should not be able create a new WITHDRAW statment with a insufficient funds", () => {

        expect(async () => {
            await createStatementUseCase.execute({ "user_id": user.id!, "type": OperationType.DEPOSIT, "amount": 99.99, "description": "deposit statement test", "sender_id": null });
            await createStatementUseCase.execute({ "user_id": user.id!, "type": OperationType.WITHDRAW, "amount": 100.00, "description": "withdraw statement test", "sender_id": null });
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);

    });

    it("should not be able create a new TRANSFER statment with a insufficient funds", async () => {
        const userTransfer = await createUserCase.execute({ name: "user transfer test", email: "usertransfer@test.com", password: "xpto123" });

        await createStatementUseCase.execute({ "user_id": user.id!, "type": OperationType.DEPOSIT, "amount": 99.99, "description": "deposit statement test", "sender_id": null });

        expect(async () => {
            await createStatementUseCase.execute({ "user_id": userTransfer.id!, "type": OperationType.TRANSFER, "amount": 100.00, "description": "transfer statement test", "sender_id": user.id! });
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);

    });

    it("should be able create a new TRANSFER statment", async () => {
        const userTransfer = await createUserCase.execute({ name: "user transfer test", email: "usertransfer@test.com", password: "xpto123" });

        await createStatementUseCase.execute({ "user_id": user.id!, "type": OperationType.DEPOSIT, "amount": 100.99, "description": "deposit statement test", "sender_id": null });
        const statement = await createStatementUseCase.execute({ "user_id": userTransfer.id!, "type": OperationType.TRANSFER, "amount": 100.00, "description": "transfer statement test", "sender_id": user.id! });

        expect(statement).toHaveProperty("id");
        expect(statement.type).toEqual(OperationType.TRANSFER);
    });
});
