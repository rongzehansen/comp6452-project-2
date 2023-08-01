import { PrismaClient } from "@prisma/client";
import Cors from 'cors';

// Prisma is an open-source database toolkit.
const prisma = new PrismaClient();

// Cors is a node.js package for providing a Connect/Express middleware 
// that can be used to enable CORS with various options.
const cors = Cors({
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
});

// a helper function to run middleware function for requests.
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
  const index = req.query.id;
  if (index) {
    const group = await prisma.group.findUnique({
      where: { index: Number(index) },
    });
    res.json(group);
  } else {
    res.status(400).send('Bad Request: id is required');
  }
}

// Handle PUT requests
export async function put(req, res) {
  const index = req.query.id;
  const { ...updateData } = req.body; // Extract index from the request body
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
  const index = req.query.id;
//   const { index } = req.body;
  if (index) {
    const deletedGroup = await prisma.group.delete({
      where: { index: Number(index) },
    });
    res.json(deletedGroup);
  } else {
    res.status(400).send('Bad Request: index is required');
  }
}

// the main request handler.
// It first runs the CORS middleware, and then dispatches the request to the appropriate handler function
// based on the HTTP method of the request.
// If the method is not one of GET, PUT, or DELETE, it returns a 405 error.
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
