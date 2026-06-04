const { verifySession, verifyAdminSession } = require("./crypto");
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

// 運営セッション（kimaru_admin_session）。ユーザー認証とは独立。
function currentOperator(event) {
  return verifyAdminSession(event);
}

function requireOperator(event) {
  const operator = currentOperator(event);
  if (!operator) {
    const error = new Error("Operator login required");
    error.statusCode = 401;
    throw error;
  }
  return operator;
}

module.exports = { currentOwner, requireOwner, currentOperator, requireOperator };
