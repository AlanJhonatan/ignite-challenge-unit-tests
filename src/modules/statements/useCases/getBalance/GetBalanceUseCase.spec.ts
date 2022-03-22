import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Balance', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it('should be able to get user balance', async () => {
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

    await createStatementUseCase.execute({
      user_id: userId,
      amount: 100,
      description: 'an 100$ deposit',
      type: OperationType.DEPOSIT,
    });

    await createStatementUseCase.execute({
      user_id: userId,
      amount: 50,
      description: 'an 50$ withdraw',
      type: OperationType.WITHDRAW,
    });

    const balance = await getBalanceUseCase.execute({ user_id: userId })

    expect(balance.statement.length).toEqual(3);
    expect(balance.balance).toEqual(150);
  });

  it('should be able to get balance with no statements', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Alan',
      email: 'alan@alan.com',
      password: '1234',
    });

    const userId = user.id as string;

    const balance = await getBalanceUseCase.execute({ user_id: userId })

    expect(balance.statement.length).toEqual(0);
    expect(balance.balance).toEqual(0);
  });

  it('should not be able to get balance if user does not exists', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: 'non existent user' })
    }).rejects.toBeInstanceOf(GetBalanceError)
  });
});
