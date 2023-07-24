import { PrismaClient } from "@prisma/client";
import Cors from 'cors';

const prisma = new PrismaClient();
const cors = Cors({
  methods: ['GET', 'HEAD', 'PUT', 'DELETE'],
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

export async function get(req, res) {
  // const { index } = req.body;
  const id = req.params;
  const index = id;
  if (index) {
    const group = await prisma.group.findUnique({
      where: { index: Number(index) },
    });
    res.json(group);
  } else {
    // const groups = await prisma.group.findMany();
    // Mock data
    const groups = [
      {id: 1, index: 1, name:'group1', owner:'owner1', timeCreated: '2023-07-01', timeUpdated:'2023-07-01'}
    ]
    res.json(groups);
  }
}

export async function put(req, res) {
  const { index, ...updateData } = req.body; // Extract index from the request body
  const updatedGroup = await prisma.group.update({
    where: { index: Number(index) }, // Use index as the where clause
    data: updateData, // Exclude index from the update data
  });
  res.json(updatedGroup);
}

export async function del(req, res) {
  const { index } = req.body;
  const deletedGroup = await prisma.group.delete({
    where: { index: Number(index) },
  });
  res.json(deletedGroup);
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  const { method } = req;
  
  switch (method) {
    case 'GET':
      return get(req, res);
    case 'PUT':
      return put(req, res);
    case 'DELETE':
      return del(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}