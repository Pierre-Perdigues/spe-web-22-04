const request = require('supertest');
const app = require('../app'); // Importez votre application Express

describe('Product CRUD', () => {
  test('GET /produits', async () => {
    const response = await request(app).get('/produits');
    expect(response.statusCode).toBe(200);
    // expect(response.body.data).toBeInstanceOf(Array);
  });

  // Ajoutez d'autres tests pour POST, PUT, DELETE...
});
