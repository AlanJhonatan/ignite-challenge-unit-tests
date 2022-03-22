import { SimpleConsoleLogger } from "typeorm";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to create an new User', async () => {
    const user = await createUserUseCase.execute({
      name: "Alan",
      email: "alan@email.com",
      password: "alan"
    });

    expect(user).toHaveProperty('id');
  });

  it('should be not able to create an user if email already exists', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Alan",
        email: "alan@email.com",
        password: "alan"
      });

      await createUserUseCase.execute({
        name: "Mario",
        email: "alan@email.com",
        password: "mario"
      });
    }).rejects.toBeInstanceOf(CreateUserError)
  });
});
