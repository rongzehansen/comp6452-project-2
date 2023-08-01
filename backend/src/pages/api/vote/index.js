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

// the main request handler.
// It first runs the CORS middleware, and then dispatches the request to the appropriate handler function
// based on the HTTP method of the request.
// If the method is not one of GET, POST, it returns a 405 error.
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
