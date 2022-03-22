import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it('should be able to create an deposit statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Alan',
      email: 'alan@alan.com',
      password: '1234',
    });

    const userId = user.id as string;

    const statementOperation = await createStatementUseCase.execute({
      user_id: userId,
      amount: 100,
      description: 'an 100$ deposit',
      type: OperationType.DEPOSIT,
    });

    expect(statementOperation).toHaveProperty('id');
    expect(statementOperation.amount).toEqual(100);
  });

  it('should not be able to create an statement if user do not exists', () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'non existent user id',
        amount: 100,
        description: 'an 100$ deposit',
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it('should be able to create an withdraw statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Alan',
      email: 'alan@alan.com',
      password: '1234',
    });

    const userId = user.id as string;

    await createStatementUseCase.execute({
      user_id: userId,
      amount: 100,
      description: 'an 100$ deposit',
      type: OperationType.DEPOSIT,
    });

    const statementOperation = await createStatementUseCase.execute({
      user_id: userId,
      amount: 100,
      description: 'an 100$ withdraw',
      type: OperationType.WITHDRAW,
    });

    expect(statementOperation).toHaveProperty('id');
    expect(statementOperation.type).toEqual(OperationType.WITHDRAW);
    expect(statementOperation.amount).toEqual(100);
  });

  it('should not be able to create an withdraw statement if insufficient funds', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Alan',
        email: 'alan@alan.com',
        password: '1234',
      });

      const userId = user.id as string;

      await createStatementUseCase.execute({
        user_id: userId,
        amount: 100,
        description: 'an 100$ withdraw',
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });
});
