import { Connection, createConnection } from "typeorm";

import request from 'supertest';
import { app } from "../../../../app";

let connection: Connection;

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create an user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Jhon Doe',
        email: 'jhon.doe@example.com',
        password: '1234',
      });

    expect(response.status).toEqual(201);
  });

  it('should not be able to create an user if email is already in use', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Doe Jhon',
        email: 'jhon.doe@example.com',
        password: '1234',
      });

    expect(response.status).toEqual(400);
  });
});
