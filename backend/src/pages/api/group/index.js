import { PrismaClient } from "@prisma/client";
import Cors from 'cors';

const prisma = new PrismaClient();
const cors = Cors({
  methods: ['GET', 'HEAD', 'POST'],
});

// Utility to run middleware manually in Next.js
// This can be moved to a separate file
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

// // GET /api/group
// export async function get(req, res) {
//   const users = await prisma.group.findMany();
//   res.json(users);
// }
// GET /api/group
export async function get(req, res) {
  const users = await prisma.group.findMany();
  // res.json(users);
  res.json([
    {id:1, name:'group1', address:'address1', owner:'owner1', createdAt: '2023-07-01', updatedAt:'2023-07-01', active: true}
  ]);
}

// POST /api/group
export async function post(req, res) {
  const result = await prisma.group.create({
    data: {
      ...req.body
    },
  });
  res.json(result);
}

export default async function handler(req, res) {
  // Run the middleware
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
