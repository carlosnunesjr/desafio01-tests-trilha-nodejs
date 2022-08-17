import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";


let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserCase: CreateUserUseCase;
let userAux: User;

describe("Tests validation authenticate user case", () => {
    beforeEach(async () => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
        createUserCase = new CreateUserUseCase(inMemoryUsersRepository);
        userAux = await createUserCase.execute({ name: "user name test", email: "usercreate@test.com", password: "xpto123" });
    });

    it("shoud be able to authenticate a user", async () => {
        const { user, token } = await authenticateUserUseCase.execute({ email: userAux.email, password: "xpto123" });
        expect(user).toHaveProperty("id");
        expect(token).not.toBeNull();
    });

    it("should not be able to authenticate with a wrong email", () => {
        expect(async () => {
            const resp = await authenticateUserUseCase.execute({ email: "wrong_email@test.com", password: "xpto123" });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });

    it("should not be able to authenticate with a wrong password", () => {
        expect(async () => {
            const resp = await authenticateUserUseCase.execute({ email: userAux.email, password: "wrong_pass" });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });
});