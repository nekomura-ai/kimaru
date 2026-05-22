const { verifySession } = require("./crypto");
const { findOwnerById } = require("./supabase");

async function currentOwner(event) {
  const session = verifySession(event);
  if (!session?.ownerId) return null;
  return findOwnerById(session.ownerId);
}

async function requireOwner(event) {
  const owner = await currentOwner(event);
  if (!owner) {
    const error = new Error("Login required");
    error.statusCode = 401;
    throw error;
  }
  return owner;
}

module.exports = { currentOwner, requireOwner };
