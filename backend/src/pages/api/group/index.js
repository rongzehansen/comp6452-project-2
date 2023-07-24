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

export async function get(req, res) {
  const id = req.params;
  const index = id;
  if (index) {
    const group = await prisma.group.findUnique({
      where: { index: Number(index) },
    });
    res.json(group);
  } else {
    const groups = await prisma.group.findMany();
    res.json(groups);
  }
}

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
    case 'POST':
      return post(req, res);
    case 'PUT':
      return put(req, res);
    case 'DELETE':
      return del(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
