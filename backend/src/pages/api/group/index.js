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

// Handle GET requests without an ID
export async function get(req, res) {
  const groups = await prisma.group.findMany();
  res.json(groups);
}

// Handle POST requests
export async function post(req, res) {
  const { index, name, owner } = req.body;
  if (index && name && owner) {
    const newGroup = await prisma.group.create({
      data: {
        index: Number(index),
        name: name,
        owner: owner,
      },
    });
    res.json(newGroup);
  } else {
    res.status(400).send('Bad Request: index, name, and owner are required');
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
