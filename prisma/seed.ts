import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create a test user for development
  const user = await prisma.user.upsert({
    where: { email: 'dev@test.com' },
    update: {},
    create: {
      email: 'dev@test.com',
      name: 'Test User',
      emailVerified: new Date(),
    },
  });

  console.log('Test user created:', user);

  // Optional: Create some sample tasks
  const sampleTasks = [
    {
      title: 'Welcome to your task tracker!',
      completed: false,
      priority: 'high',
      timeCost: 15,
      userId: user.id,
    },
    {
      title: 'Try creating a new task',
      completed: false,
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0], // Today
      timeCost: 30,
      userId: user.id,
    },
  ];

  for (const taskData of sampleTasks) {
    await prisma.task.upsert({
      where: { id: `sample-${taskData.title.slice(0, 10)}` },
      update: {},
      create: taskData,
    });
  }

  console.log('Sample tasks created');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
