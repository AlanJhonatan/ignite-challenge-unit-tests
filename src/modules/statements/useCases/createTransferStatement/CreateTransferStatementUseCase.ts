import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";

interface IRequest {
  receiver_id: string;
  sender_id: string;
  amount: number;
  description: string;
}

@injectable()
class CreateTransferStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,
  ) {}

  async execute({
    sender_id, receiver_id, amount, description
  }: IRequest): Promise<Statement> {
    if(sender_id === receiver_id) {
      throw new CreateStatementError.SelfTransfer();
    }

    const sender = await this.usersRepository.findById(sender_id);
    const receiver = await this.usersRepository.findById(receiver_id);

    if(!sender) {
      throw new AppError('Sender not found');
    }

    if(!receiver) {
      throw new AppError('Receiver not found');
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender.id as string
    });

    if(balance < amount) {
      throw new CreateStatementError.InsufficientFunds();
    }

    const transfer = await this.statementsRepository.create({
      user_id: receiver.id as string,
      sender_id: sender.id as string,
      type: OperationType.TRANSFER,
      amount,
      description,
    })

    return transfer;
  }
}

export { CreateTransferStatementUseCase}
