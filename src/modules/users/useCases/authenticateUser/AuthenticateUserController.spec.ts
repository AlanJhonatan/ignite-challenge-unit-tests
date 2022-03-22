import { Connection, createConnection } from "typeorm";

import request from 'supertest';
import { app } from "../../../../app";

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Jhon Doe',
        email: 'jhon.doe@example.com',
        password: '1234',
      });

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'jhon.doe@example.com',
        password: '1234',
      });

    expect(response.body).toHaveProperty('token');
    expect(response.status).toEqual(200);
  });

  it('should not be able to authenticate an user if email does not exists', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'non-existent-email@example.com',
        password: '1234',
      });

    expect(response.status).toEqual(401);
  });

  it('should not be able to authenticate an user if password does match', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'jhon.doe@example.com',
        password: 'wrong password',
      });

    expect(response.status).toEqual(401);
  });
});
