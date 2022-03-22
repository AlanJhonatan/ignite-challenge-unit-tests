import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  })

  it('should be able to show user profile', async () => {
    const user = await createUserUseCase.execute({
      name: 'Alan',
      email: 'alan@alan.com',
      password: '1234',
    });

    const id = user.id as string;

    const profile = await showUserProfileUseCase.execute(id);

    expect(profile).toEqual(user);
  });

  it('should not be able to show a user profile if doesnt exists', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('non existent id');
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  });

});
