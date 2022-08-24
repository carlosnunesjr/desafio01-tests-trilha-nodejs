import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const { receiver_id } = request.params;

    const originalUrl = request.originalUrl.replace(`/${receiver_id}`, "");
    const splittedPath = originalUrl.split('/')
    const type = splittedPath[splittedPath.length - 1] as OperationType;

    const createStatement = container.resolve(CreateStatementUseCase);

    let userid_request = user_id;
    let sender_id = null;
    if (type === OperationType.TRANSFER && receiver_id) {
      userid_request = receiver_id;
      sender_id = user_id;
    }

    const statement = await createStatement.execute({
      user_id: userid_request,
      type,
      amount,
      description,
      sender_id
    });

    return response.status(201).json(statement);
  }
}
