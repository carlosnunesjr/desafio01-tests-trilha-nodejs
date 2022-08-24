import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserCase: CreateUserUseCase;
let user: User;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Tests validation get balance case", () => {
    beforeEach(async () => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserCase = new CreateUserUseCase(inMemoryUsersRepository);
        user = await createUserCase.execute({ name: "user name test", email: "usercreate@test.com", password: "xpto123" });

        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    });

    it("should be able to get balance by user id", async () => {

        await createStatementUseCase.execute({ "user_id": user.id!, "type": OperationType.DEPOSIT, "amount": 99.99, "description": "statement test", "sender_id": null });
        const balance = await getBalanceUseCase.execute({ "user_id": user.id! });
        expect(balance).toHaveProperty("balance");
        expect(balance.statement).toHaveLength(1);
    });

    it("should not be able to get balance with a non-existent user", () => {

        expect(async () => {
            await getBalanceUseCase.execute({ "user_id": "non-existent" });
        }).rejects.toBeInstanceOf(GetBalanceError);

    });
});