import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;


describe('Authenticate User Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
  });

  it('should be able to authenticate an user', async () => {
    const user = await createUserUseCase.execute({
      name: 'Alan',
      email: 'alan@email.com',
      password: '1234',
    });

    const auth = await authenticateUserUseCase.execute({
      email: 'alan@email.com',
      password: '1234',
    });

    expect(auth.user.id).toEqual(user.id);
    expect(auth).toHaveProperty('token');
  });

  it('should not be able to authenticate if email is incorrect', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'Alan',
        email: 'alan@email.com',
        password: '1234',
      });

      await authenticateUserUseCase.execute({
        email: 'mario@email.com',
        password: '1234',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate if password is incorrect', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'Alan',
        email: 'alan@email.com',
        password: '1234',
      });

      await authenticateUserUseCase.execute({
        email: 'alan@email.com',
        password: '4321',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
