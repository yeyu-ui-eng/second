import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fashion.com' },
    update: {},
    create: {
      email: 'admin@fashion.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      phone: '+1-555-0100',
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: 'sales@fashion.com' },
    update: {},
    create: {
      email: 'sales@fashion.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.SALES,
      phone: '+1-555-0101',
    },
  });

  const sales2 = await prisma.user.upsert({
    where: { email: 'sales2@fashion.com' },
    update: {},
    create: {
      email: 'sales2@fashion.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Chen',
      role: UserRole.SALES,
      phone: '+1-555-0102',
    },
  });

  const production = await prisma.user.upsert({
    where: { email: 'production@fashion.com' },
    update: {},
    create: {
      email: 'production@fashion.com',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'Kim',
      role: UserRole.PRODUCTION,
      phone: '+1-555-0103',
    },
  });

  const prod2 = await prisma.user.upsert({
    where: { email: 'production2@fashion.com' },
    update: {},
    create: {
      email: 'production2@fashion.com',
      password: hashedPassword,
      firstName: 'Lisa',
      lastName: 'Park',
      role: UserRole.PRODUCTION,
      phone: '+1-555-0104',
    },
  });

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Classic Blazer',
        sku: 'BLZ-001',
        category: 'Outerwear',
        price: 299.99,
        cost: 150.00,
        sizes: 'XS,S,M,L,XL',
        colors: 'Black,Navy,Gray',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Slim Fit Trousers',
        sku: 'TRS-001',
        category: 'Bottoms',
        price: 149.99,
        cost: 75.00,
        sizes: '28,30,32,34,36',
        colors: 'Black,Charcoal,Navy',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Silk Evening Dress',
        sku: 'DRS-001',
        category: 'Dresses',
        price: 499.99,
        cost: 250.00,
        sizes: 'XS,S,M,L',
        colors: 'Red,Burgundy,Black,Emerald',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Cotton Oxford Shirt',
        sku: 'SHT-001',
        category: 'Shirts',
        price: 89.99,
        cost: 40.00,
        sizes: 'XS,S,M,L,XL,XXL',
        colors: 'White,Blue,Pink,Striped',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Cashmere Sweater',
        sku: 'SWT-001',
        category: 'Knitwear',
        price: 199.99,
        cost: 100.00,
        sizes: 'XS,S,M,L,XL',
        colors: 'Cream,Gray,Navy,Burgundy',
      },
    }),
  ]);

  const customers = await Promise.all([
    prisma.customer.create({
      data: { firstName: 'Emma', lastName: 'Wilson', email: 'emma@example.com', phone: '+1-555-1001', city: 'New York' },
    }),
    prisma.customer.create({
      data: { firstName: 'James', lastName: 'Brown', email: 'james@example.com', phone: '+1-555-1002', city: 'Los Angeles' },
    }),
    prisma.customer.create({
      data: { firstName: 'Sophia', lastName: 'Martinez', email: 'sophia@example.com', phone: '+1-555-1003', city: 'Chicago' },
    }),
    prisma.customer.create({
      data: { firstName: 'Oliver', lastName: 'Taylor', email: 'oliver@example.com', phone: '+1-555-1004', city: 'Miami' },
    }),
    prisma.customer.create({
      data: { firstName: 'Ava', lastName: 'Anderson', email: 'ava@example.com', phone: '+1-555-1005', city: 'San Francisco' },
    }),
  ]);

  const statuses = ['NEW', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'DELIVERED'] as const;
  for (let i = 0; i < 25; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const salesRep = Math.random() > 0.5 ? sales : sales2;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const qty = Math.floor(Math.random() * 5) + 1;

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-SEED-${String(i + 1).padStart(4, '0')}`,
        customerId: customer.id,
        productId: product.id,
        userId: salesRep.id,
        quantity: qty,
        unitPrice: product.price,
        totalPrice: qty * product.price,
        status,
        paymentStatus: status === 'DELIVERED' ? 'PAID' : Math.random() > 0.5 ? 'PENDING' : 'PARTIAL',
        orderDate: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)),
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        notes: `Sample order #${i + 1}`,
      },
    });

    if (status !== 'NEW') {
      const stages = ['ASSIGNED', 'CUTTING', 'SEWING', 'QUALITY_CHECK', 'PACKAGING', 'READY'];
      const stageIdx = status === 'CONFIRMED' ? 0 : status === 'IN_PRODUCTION' ? Math.floor(Math.random() * 4) + 1 : stages.length - 1;
      const prodUser = Math.random() > 0.5 ? production : prod2;

      await prisma.productionTask.create({
        data: {
          orderId: order.id,
          assignedTo: prodUser.id,
          stage: stages[stageIdx] as any,
          startedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
          completedAt: status === 'DELIVERED' || status === 'READY' ? new Date() : null,
          notes: status === 'DELIVERED' ? 'Completed on time.' : 'In progress.',
        },
      });
    }
  }

  await prisma.systemSetting.create({
    data: { key: 'company_name', value: 'Fashion Elegance Co.' },
  });
  await prisma.systemSetting.create({
    data: { key: 'commission_rate', value: '5' },
  });
  await prisma.systemSetting.create({
    data: { key: 'currency', value: 'USD' },
  });

  console.log('Seed data created successfully!');
  console.log('Admin login: admin@fashion.com / admin123');
  console.log('Sales login: sales@fashion.com / admin123');
  console.log('Production login: production@fashion.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
