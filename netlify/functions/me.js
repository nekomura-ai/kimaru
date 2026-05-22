const { json } = require("./_lib/response");
const { currentOwner } = require("./_lib/auth");

exports.handler = async (event) => {
  try {
    const owner = await currentOwner(event);
    return json(200, { owner });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
