import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserCase: CreateUserUseCase;

describe("Tests validation create user case", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserCase = new CreateUserUseCase(inMemoryUsersRepository);
    });

    it("should be able create a new user", async () => {


        const user = await createUserCase.execute({ name: "user name test", email: "usercreate@test.com", password: "xpto123" });
        expect(user).toHaveProperty("id");
    });

    it("should no be able to create a new user with an already existing email", () => {
        expect(async () => {
            const user1 = await createUserCase.execute({ name: "user1 name test", email: "usercreate@test.com", password: "xpto123" });
            const user2 = await createUserCase.execute({ name: "user1 name test", email: "usercreate@test.com", password: "xpto123" });
        }).rejects.toBeInstanceOf(CreateUserError);
    });
});