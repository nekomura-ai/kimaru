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
    const error = new Error("ログインが必要です");
    error.statusCode = 401;
    throw error;
  }
  return owner;
}

// 有料(Pro)限定の機能・APIで使う。無料ユーザーは 403。Cat Key 承認済みは plan='pro' になるため通る。
async function requireProOwner(event) {
  const owner = await requireOwner(event);
  if (owner.plan !== "pro") {
    const error = new Error("この機能はPro版でご利用いただけます。");
    error.statusCode = 403;
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
    const error = new Error("運営ログインが必要です");
    error.statusCode = 401;
    throw error;
  }
  return operator;
}

module.exports = { currentOwner, requireOwner, requireProOwner, currentOperator, requireOperator };
