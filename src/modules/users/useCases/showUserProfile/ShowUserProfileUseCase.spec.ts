import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let userAux: User;

describe("Tests validation authenticate user case", () => {
    beforeEach(async () => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserCase = new CreateUserUseCase(inMemoryUsersRepository);
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
        userAux = await createUserCase.execute({ name: "user name test", email: "usercreate@test.com", password: "xpto123" });
    });

    it("shoud be able to find a user by id", async () => {
        const user = await showUserProfileUseCase.execute(userAux.id!);
        expect(user).not.toBeNull();
        expect(user).toHaveProperty("id");
    });

    it("shoud not be able to find a user with wrong id", () => {
        expect(async () => {
            await showUserProfileUseCase.execute("wrong_id");
        }).rejects.toBeInstanceOf(ShowUserProfileError);

    });

});