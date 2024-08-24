import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'query',
    },
  ],
});

async function main() {
  /* await prismaClient.user.createMany({
    data: [
      {
        email: 'yyyy@qq.com',
        name: 'inigo',
      },
      {
        email: 'zzzz@163.com',
        name: 'zhao',
      },
    ],
  }); */
  /* await prismaClient.user.create({
    data: {
      email: 'aaaa@gmail.com',
      name: 'jun',
      post: {
        createMany: {
          data: [
            {
              title: '春望',
              content: '烽火连三月，家书抵万金',
            },
            {
              title: '悯农',
              content: '锄禾日当午，汗滴禾下土'
            }
          ]
        }
      }
    }
  }) */
  /* await prismaClient.user.update({
    where: {
      id: 4,
    },
    data: {
      name: 'juntong',
    },
  });
  await prismaClient.user.delete({
    where: {
      id: 2,
    },
  }); */
  const users = await prismaClient.user.findMany({
    where: {
      // id: 4,
      OR: [
        {
          name: { contains: 'tong' },
        },
        {
          email: { contains: 'aaaa@gmail.com' },
        },
      ],
    },
    include: {
      // post: true,
      Post: {
        where: {
          title: '春望',
        },
      },
    },
    orderBy: {
      name: 'desc',
    },
  });
  // const users = await prismaClient.user.findUnique({
  /* const users = await prismaClient.user.findUniqueOrThrow({
    where: {
      email: 'zzzz@163.com',
    },
    select: {
      id: true,
      name: true,
    },
  }); */
  const count = await prismaClient.post.aggregate({
    where: {
      published: false,
    },
    _count: {
      _all: true,
    },
  });
  console.log('count', count);
  console.dir(users, { depth: null });
}

main();
