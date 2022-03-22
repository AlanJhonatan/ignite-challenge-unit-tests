import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Statement Operation', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('should be able to get statement operation', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Alan',
      email: 'alan@alan.com',
      password: '1234',
    });

    const statementOperation = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 100,
      description: 'an 100$ deposit',
      type: OperationType.DEPOSIT,
    });

    const resultStatement = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statementOperation.id as string
    });

    expect(resultStatement).toEqual(statementOperation);
  });

  it('should not be able to get statement operation if user does not exists', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Alan',
        email: 'alan@alan.com',
        password: '1234',
      });

      const statementOperation = await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 100,
        description: 'an 100$ deposit',
        type: OperationType.DEPOSIT,
      });

      const resultStatement = await getStatementOperationUseCase.execute({
        user_id: 'non existent user id',
        statement_id: statementOperation.id as string
      });

      expect(resultStatement).toEqual(statementOperation);
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should not be able to get statement operation if statement does not exists', () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Alan',
        email: 'alan@alan.com',
        password: '1234',
      });

      const statementOperation = await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 100,
        description: 'an 100$ deposit',
        type: OperationType.DEPOSIT,
      });

      const resultStatement = await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: 'non existent statement id',
      });

      expect(resultStatement).toEqual(statementOperation);
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
