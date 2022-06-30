import { getSession } from "@auth0/nextjs-auth0";
import nc from "next-connect";
import { connectToDatabase } from "./../../utils/db";

const handler = nc({ attachParams: true });

async function getHistory(req, res) {
  const { user } = getSession(req, res);
  const { db } = await connectToDatabase();
  const { least, most } = req.query;

  const docs = await db
    .collection("transactions")
    .aggregate([
      {
        $match: {
          creator: user.sub,
          date: {
            $gte: Number(least),
            $lte: Number(most),
          },
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ])
    .toArray();
  res.send({ sucess: true, docs });
}
handler.get(getHistory);
export default handler;
