import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { username: 'test' },
    update: {},
    create: {
      username: 'test',
      password: 'test', // En producción, hashear
      role: 'streamer',
    },
  });

  const wheel = await prisma.wheel.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Test Wheel',
      userId: user.id,
      segments: {
        create: [
          { label: 'Prize 1', color: '#ff0000', probability: 0.2 },
          { label: 'Prize 2', color: '#00ff00', probability: 0.3 },
          { label: 'Prize 3', color: '#0000ff', probability: 0.5 },
        ],
      },
    },
  });

  console.log({ user, wheel });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });