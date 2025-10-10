import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultTenantId = 'cmf3mwg3u09hspoye9ggodyvh'; // your fixed cuid
  const defaultTenantName = 'Multichoice';

  await prisma.tenant.upsert({
    where: { id: defaultTenantId },
    update: {},
    create: {
      id: defaultTenantId,
      name: defaultTenantName,
    },
  });

  console.log('✅ Default Tenant created or already exists.');
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
