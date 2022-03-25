import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

interface IExpectBalance {
  balance: number;
  statement: Statement[];
}

let inMemoStatementsRepository: InMemoryStatementsRepository;
let inMemoUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createTransferStatementUseCase: CreateTransferStatementUseCase;

describe('Create Transfer Statement Use Case', () => {

  beforeEach(() => {
    inMemoStatementsRepository= new InMemoryStatementsRepository();
    inMemoUsersRepository = new InMemoryUsersRepository();

    createStatementUseCase = new CreateStatementUseCase(
      inMemoUsersRepository,
      inMemoStatementsRepository
    );

    createTransferStatementUseCase = new CreateTransferStatementUseCase(
      inMemoUsersRepository,
      inMemoStatementsRepository
    );
  });

  it('should be able to create an transfer statement', async () => {
    const sender = await inMemoUsersRepository.create({
      name: 'Sender User',
      email: 'sender@sender.com',
      password: '1234'
    });

    const receiver = await inMemoUsersRepository.create({
      name: 'Receiver User',
      email: 'receiver@receiver.com',
      password: '1234'
    });

    await createStatementUseCase.execute({
      user_id: sender.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'An initial deposit',
    });


    const transfer = await createTransferStatementUseCase.execute({
      sender_id: sender.id as string,
      receiver_id: receiver.id as string,
      description: 'An simple transfer for you',
      amount: 50,
    });

    expect(transfer.amount).toEqual(50);
    expect(transfer.sender_id).toEqual(sender.id);
    expect(transfer.user_id).toEqual(receiver.id);
  });

  it('should not be able to create an transfer if user has insufficient founds', async () => {
    const sender = await inMemoUsersRepository.create({
      name: 'Sender User',
      email: 'sender@sender.com',
      password: '1234'
    });

    const receiver = await inMemoUsersRepository.create({
      name: 'Receiver User',
      email: 'receiver@receiver.com',
      password: '1234'
    });

    await expect(
      createTransferStatementUseCase.execute({
        sender_id: sender.id as string,
        receiver_id: receiver.id as string,
        amount: 100,
        description: 'An simple broken transfer',
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });

  it('should be able to get balance with transfers', async () => {
    const sender = await inMemoUsersRepository.create({
      name: 'Sender User',
      email: 'sender@sender.com',
      password: '1234'
    });

    const receiver = await inMemoUsersRepository.create({
      name: 'Receiver User',
      email: 'receiver@receiver.com',
      password: '1234'
    });

    await createStatementUseCase.execute({
      user_id: sender.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'An initial deposit',
    });

    const transfer = await createTransferStatementUseCase.execute({
      sender_id: sender.id as string,
      receiver_id: receiver.id as string,
      description: 'An simple transfer for you',
      amount: 50,
    });

    const senderBalance = await inMemoStatementsRepository.getUserBalance({
      user_id: receiver.id as string,
      with_statement: true,
    }) as IExpectBalance;

    const receiverBalance = await inMemoStatementsRepository.getUserBalance({
      user_id: receiver.id as string,
      with_statement: true,
    }) as IExpectBalance;

    expect(senderBalance.balance).toEqual(50);
    expect(receiverBalance.balance).toEqual(50);
    expect(senderBalance.statement).toContainEqual(transfer);
    expect(receiverBalance.statement).toContainEqual(transfer);
  });
});
