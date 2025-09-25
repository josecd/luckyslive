const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Verificando base de datos...');

    const wheels = await prisma.wheel.findMany({
      include: { segments: true }
    });

    console.log(`Encontradas ${wheels.length} ruletas:`);
    wheels.forEach(wheel => {
      console.log(`- ${wheel.name} (ID: ${wheel.id}) - ${wheel.segments.length} segmentos`);
    });

    const spins = await prisma.spin.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5
    });

    console.log(`\nÚltimos ${spins.length} giros:`);
    spins.forEach(spin => {
      console.log(`- ${spin.result} (Usuario: ${spin.userId || 'N/A'}, Tipo: ${spin.triggerType || 'N/A'})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();