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

// Handle GET requests with an ID
export async function get(req, res) {
  const id = req.query.id;
  if (id) {
    const group = await prisma.group.findUnique({
      where: { index: Number(id) },
    });
    res.json(group);
  } else {
    res.status(400).send('Bad Request: id is required');
  }
}

// Handle PUT requests
export async function put(req, res) {
  const { index, ...updateData } = req.body; // Extract index from the request body
  if (index) {
    const updatedGroup = await prisma.group.update({
      where: { index: Number(index) }, // Use index as the where clause
      data: updateData, // Exclude index from the update data
    });
    res.json(updatedGroup);
  } else {
    res.status(400).send('Bad Request: index is required');
  }
}

// Handle DELETE requests
export async function del(req, res) {
  const { index } = req.body;
  if (index) {
    const deletedGroup = await prisma.group.delete({
      where: { index: Number(index) },
    });
    res.json(deletedGroup);
  } else {
    res.status(400).send('Bad Request: index is required');
  }
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
