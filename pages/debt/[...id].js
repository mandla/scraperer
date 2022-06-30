import { ObjectId } from "mongodb";
import { connectToDatabase } from "./../../utils/db";
export default function Debt({ data }) {
  const [
    {
      clientele: [{ name }],
      item,
      amount,
      date,
    },
  ] = data;

  return (
    <div className="cover">
      <div className="debt">
        <h3>
          {name}'s Balance - <span>&#x20A6;{amount}</span>
        </h3>
        <h4>
          Item - <span>{item}</span>
        </h4>

        <h4>
          Due on - <span>{new Date(date).toDateString()}</span>
        </h4>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const { params } = ctx;

  try {
    const { db } = await connectToDatabase();

    const docs = await db
      .collection("debt")
      .aggregate([
        {
          $match: {
            _id: ObjectId(params.id[0]),
          },
        },
        {
          $lookup: {
            from: "customers",
            let: { customerId: "$customer" },
            pipeline: [
              { $addFields: { userId: { $toString: "$_id" } } },
              {
                $match: {
                  $expr: {
                    $eq: ["$userId", "$$customerId"],
                  },
                },
              },
            ],
            as: "clientele",
          },
        },
      ])
      .toArray();

    return {
      props: {
        data: JSON.parse(JSON.stringify(docs)),
      },
    };
  } catch (error) {
    return {
      props: {
        data: null,
      },
    };
  }
}
