import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

class CreateTransferStatementController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.params;
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;

    const createTransferStatementUseCase = container.resolve(
      CreateTransferStatementUseCase
    )

    const statement = await createTransferStatementUseCase.execute({
      receiver_id: user_id,
      sender_id,
      description,
      amount
    });

    return response.json(statement);
  }
}

export { CreateTransferStatementController }
