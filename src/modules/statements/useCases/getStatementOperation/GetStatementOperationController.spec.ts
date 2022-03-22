import { Connection, createConnection } from "typeorm";

import request from 'supertest';
import { app } from "../../../../app";
import { createImportSpecifier } from "typescript";

let connection: Connection;

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get statement operation', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Jhon Doe',
        email: 'jhon.doe@example.com',
        password: '1234',
      });

    const tokenResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'jhon.doe@example.com',
        password: '1234',
      });

    const { token } = tokenResponse.body;

    const depositResponse = await request(app)
      .post('/api/v1/statements/deposit')
      .set({ Authorization: `Bearer ${token}`})
      .send({ amount: 100.00, description: 'testing an 100 deposit'});

    const statementOperation = depositResponse.body;

    const response = await request(app)
      .get(`/api/v1/statements/${statementOperation.id}`)
      .set({ Authorization: `Bearer ${token}`});

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toEqual(statementOperation.id);
  });
});
