
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Checking if Product model exists on prisma client instance...')
     // @ts-ignore
    if (prisma.product) {
      console.log('SUCCESS: prisma.product is defined.')
      // @ts-ignore
      const count = await prisma.product.count()
      console.log(`Current product count: ${count}`)
    } else {
      console.error('FAILURE: prisma.product is UNDEFINED.')
    }
  } catch (e) {
    console.error('An error occurred:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
