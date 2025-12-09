const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv/config');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected.');

    console.log('Querying Business table...');
    const businesses = await prisma.business.findMany();
    console.log('Businesses found:', businesses.length);
    console.log(businesses);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
