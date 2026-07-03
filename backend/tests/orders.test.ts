import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/app';

let token: string;
let productId: string;
let customerId: string;

beforeAll(async () => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('testpassword123', 12);
  await prisma.user.upsert({
    where: { email: 'ordertest@test.com' },
    update: {},
    create: {
      email: 'ordertest@test.com',
      password: hashedPassword,
      firstName: 'Order',
      lastName: 'Test',
      role: 'SALES',
    },
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'ordertest@test.com', password: 'testpassword123' });
  token = loginRes.body.accessToken;

  const product = await prisma.product.create({
    data: { name: 'Test Product', sku: `TEST-${Date.now()}`, price: 99.99 },
  });
  productId = product.id;

  const customer = await prisma.customer.create({
    data: { firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
  });
  customerId = customer.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Orders API', () => {
  describe('POST /api/orders', () => {
    it('should create an order', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customerId,
          productId,
          quantity: 2,
          unitPrice: 99.99,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('orderNumber');
      expect(res.body.totalPrice).toBe(199.98);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 1 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/orders', () => {
    it('should return orders list', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
    });
  });
});
