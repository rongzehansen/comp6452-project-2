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

// Handle GET requests with a groupId
export async function get(req, res) {
  const groupId = req.query.groupId;
  if (groupId) {
    const vote = await prisma.vote.findUnique({
      where: { groupId: groupId },
    });
    res.json(vote);
  } else {
    res.status(400).send('Bad Request: groupId is required');
  }
}

// Handle PUT requests
export async function put(req, res) {
  const { groupId, ...updateData } = req.body; // Extract groupId from the request body
  if (groupId) {
    const vote = await prisma.vote.findUnique({
      where: { groupId: groupId },
    });
    if (vote){
      const voteJson = JSON.parse(vote.voteResult)
      // const dataJson = JSON.parse(updateData) // this may not be needed since updateData is already parsed as json.
      const updatedVote = await prisma.vote.update({
        where: { groupId: groupId }, // Use groupId as the where clause
        data: {
          groupId: groupId,
          voteResult: JSON.stringify({...voteJson, ...updateData})
        }, // Exclude groupId from the update data
      });
      res.json(updatedVote);
    } else {
      res.status(400).send('Bad Request: groupId is required');
    }   
  } else {
    res.status(400).send('Bad Request: groupId is required');
  }
}

// Handle DELETE requests
export async function del(req, res) {
  const { groupId } = req.body;
  if (groupId) {
    const deletedVote = await prisma.vote.delete({
      where: { groupId: groupId },
    });
    res.json(deletedVote);
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
    case 'PUT':
      return put(req, res);
    case 'DELETE':
      return del(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
