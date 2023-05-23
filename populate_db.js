// https://api.quotable.io/quotes/random?limit=20

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

require("dotenv").config();

const bcrypt = require("bcrypt");

async function getQuotes() {
  const response = await fetch(
    "https://api.quotable.io/quotes/random?limit=50"
  );
  const jsonData = await response.json();

  for (const [key, value] of Object.entries(jsonData)) {
    const createPost = await prisma.post.create({
      data: {
        content: value.content,
        author: {
          connectOrCreate: {
            where: {
              name: value.author,
            },
            create: {
              name: value.author,
              hash: bcrypt.hash(process.env.COMMON_PASSWORD, 10).toString(),
            },
          },
        },
      },
      include: {
        author: true,
      },
    });

    console.log(`Creating:
        ${key} - ${value.author}: ${value.content}
    `);
  }
}

async function getLastTwentyPosts() {
  const posts = await prisma.post.findMany({
    take: -20,

    orderBy: {
      published: "desc",
    },
  });
  console.log(posts);
}

async function deleteAllDB() {
  const deletePosts = prisma.post.deleteMany({});
  const deleteUsers = prisma.user.deleteMany({});

  await prisma.$transaction([deletePosts, deleteUsers]);
}

deleteAllDB();
getQuotes();
