import { Connection, createConnection } from "typeorm";

import request from 'supertest';
import { app } from "../../../../app";

let connection: Connection;

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get user profile', async () => {
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
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty('id');
    expect(response.status).toEqual(200);
  });
});
