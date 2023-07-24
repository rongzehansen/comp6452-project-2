const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createVote(groupId, voteResult) {
  return prisma.vote.create({
    data: {
      groupId,
      voteResult,
    },
  });
}

async function updateVote(groupId, updatedVoteResult) {
  return prisma.vote.update({
    where: {
      groupId,
    },
    data: {
      voteResult: updatedVoteResult,
    },
  });
}

async function getVote(groupId) {
  return prisma.vote.findUnique({
    where: {
      groupId,
    },
  });
}

async function deleteVote(groupId) {
  return prisma.vote.delete({
    where: {
      groupId,
    },
  });
}

const voteData = {
  yes: 10,
  no: 5,
  maybe: 3,
};

// Create a new vote
createVote('group123', voteData)
  .then((createdVote) => {
    console.log('Vote created:', createdVote);

    // Update the vote
    const updatedVoteData = {
      yes: 15,
      no: 8,
      maybe: 4,
    };
    updateVote('group123', updatedVoteData)
      .then((updatedVote) => {
        console.log('Vote updated:', updatedVote);

        // Get the vote
        getVote('group123')
          .then((retrievedVote) => {
            console.log('Vote retrieved:', retrievedVote);

            // Delete the vote
            deleteVote('group123')
              .then((deletedVote) => {
                console.log('Vote deleted:', deletedVote);
              })
              .catch((error) => {
                console.error('Error deleting vote:', error);
              });
          })
          .catch((error) => {
            console.error('Error retrieving vote:', error);
          });
      })
      .catch((error) => {
        console.error('Error updating vote:', error);
      });
  })
  .catch((error) => {
    console.error('Error creating vote:', error);
  });
