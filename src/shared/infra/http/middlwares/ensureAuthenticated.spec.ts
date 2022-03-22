import request from 'supertest';
import { Connection, createConnection } from "typeorm";

import { ensureAuthenticated } from "./ensureAuthenticated";
import { NextFunction, Request, Response } from "express";
import { JWTTokenMissingError } from "../../../errors/JWTTokenMissingError";
import { JWTInvalidTokenError } from "../../../errors/JWTInvalidTokenError";
import { UsersRepository } from "../../../../modules/users/repositories/UsersRepository";
import { app } from '../../../../app';
import { CreateUserUseCase } from '../../../../modules/users/useCases/createUser/CreateUserUseCase';

let connection: Connection;

let req: Partial<Request>;
let res: Partial<Response>;
let next: Partial<NextFunction>;

let usersRepository: UsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Ensure Authenticated Middleware', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    usersRepository = new UsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);

    req = { headers: { authorization: '' }};
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  beforeEach(() => {
    req = { headers: { authorization: '' }};
  });

  it('should be not able to validate if token is missing', async () => {
    expect(async () => {
      await ensureAuthenticated(req as Request, res as Response, next as NextFunction);
    }).rejects.toBeInstanceOf(JWTTokenMissingError)
  });

  it('should be not able to accept an invalid token', async () => {
    expect(async () => {
      const token = 'An invalid token';

      Object.assign(req, {
        headers: {
          authorization: token
        }
      });

      await ensureAuthenticated(req as Request, res as Response, next as NextFunction);
    }).rejects.toBeInstanceOf(JWTInvalidTokenError)
  });
});
