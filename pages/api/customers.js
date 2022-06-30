import { connectToDatabase } from "./../../utils/db";
import { getSession } from "@auth0/nextjs-auth0";
import nc from "next-connect";

const handler = nc();

async function getCustomers(req, res) {
  const { user } = getSession(req, res);
  const { db } = await connectToDatabase();
  const docs = await db
    .collection("customers")
    .aggregate([
      {
        $match: {
          creator: user.sub,
        },
      },
      { $addFields: { userId: { $toString: "$_id" } } },
      {
        $lookup: {
          from: "debt",
          localField: "userId",
          foreignField: "customer",
          as: "debt",
        },
      },
    ])
    .toArray();
  res.send({ success: true, docs });
}

async function createCustomer(req, res) {
  const { user } = getSession(req, res);
  try {
    const { db } = await connectToDatabase();
    const {
      ops: [doc],
    } = await db
      .collection("customers")
      .insertOne({ ...req.body, creator: user.sub });
    res.send({ success: true, doc });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }

  res.send();
}
handler.get(getCustomers).post(createCustomer);
export default handler;
