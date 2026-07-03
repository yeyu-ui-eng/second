import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/app';

let adminToken: string;
let salesToken: string;

beforeAll(async () => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('testpassword123', 12);

  await prisma.user.upsert({
    where: { email: 'admin-prod@test.com' },
    update: {},
    create: { email: 'admin-prod@test.com', password: hashedPassword, firstName: 'Admin', lastName: 'Prod', role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { email: 'sales-prod@test.com' },
    update: {},
    create: { email: 'sales-prod@test.com', password: hashedPassword, firstName: 'Sales', lastName: 'Prod', role: 'SALES' },
  });

  const adminLogin = await request(app).post('/api/auth/login').send({ email: 'admin-prod@test.com', password: 'testpassword123' });
  adminToken = adminLogin.body.accessToken;

  const salesLogin = await request(app).post('/api/auth/login').send({ email: 'sales-prod@test.com', password: 'testpassword123' });
  salesToken = salesLogin.body.accessToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Products API', () => {
  it('should create product (admin)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Dress', sku: `DRS-${Date.now()}`, price: 249.99, category: 'Dresses' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', 'New Dress');
  });

  it('should reject product creation by sales', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ name: 'Unauthorized', sku: `UNAUTH-${Date.now()}`, price: 10 });

    expect(res.status).toBe(403);
  });

  it('should list products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});
