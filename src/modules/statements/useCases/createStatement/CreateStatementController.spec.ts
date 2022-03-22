import { Connection, createConnection } from "typeorm";

import request from 'supertest';
import { app } from "../../../../app";

let connection: Connection;

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create an deposit statement', async () => {
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

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .set({ Authorization: `Bearer ${token}`})
      .send({ amount: 100, description: 'testing an 100 deposit'});

    expect(response.body).toHaveProperty('id');
    expect(response.body.type).toEqual('deposit');
    expect(response.body.amount).toEqual(100);
    expect(response.status).toEqual(201);
  });

  it('should be able to create an withdraw statement', async () => {
    const tokenResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'jhon.doe@example.com',
        password: '1234',
      });

    const { token } = tokenResponse.body;

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({ Authorization: `Bearer ${token}`})
      .send({ amount: 100, description: 'testing an 100 withdraw'});

    expect(response.body).toHaveProperty('id');
    expect(response.body.type).toEqual('withdraw');
    expect(response.body.amount).toEqual(100);
    expect(response.status).toEqual(201);
  });

  it('should not be able to create an withdraw statement if insufficient funds', async () => {
    const tokenResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'jhon.doe@example.com',
        password: '1234',
      });

    const { token } = tokenResponse.body;

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({ Authorization: `Bearer ${token}`})
      .send({ amount: 100, description: 'testing an 100 withdraw'});

    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual('Insufficient funds');
  });
});
