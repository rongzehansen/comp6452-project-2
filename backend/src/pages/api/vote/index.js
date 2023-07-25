import { PrismaClient } from "@prisma/client";
import Cors from 'cors';

const prisma = new PrismaClient();
const cors = Cors({
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
});

export async function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Handle GET requests without a groupId
export async function get(req, res) {
  const votes = await prisma.vote.findMany();
  res.json(votes);
}
// export async function get(req, res) {
//   res.status(400).send('Bad Request: groupId is required');
// }

// Handle POST requests
export async function post(req, res) {
  const { groupId } = req.body;
  if (groupId) {
    const newVote = await prisma.vote.create({
      data: {
        groupId: Number(groupId),
        voteResult: JSON.stringify({}), // empty json is created as a voteResult
      },
    });
    res.json(newVote);
  } else {
    res.status(400).send('Bad Request: groupId is required');
  }
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  const { method } = req;
  
  switch (method) {
    case 'GET':
      return get(req, res);
    case 'POST':
      return post(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
