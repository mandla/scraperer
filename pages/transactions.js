import { useEffect, useState } from "react";
import axios from "axios";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangePicker } from "react-date-range";
import { addDays } from "date-fns";
import { connectToDatabase } from "./../utils/db";
import { getSession } from "@auth0/nextjs-auth0";
import Layout from "./../components/Layout";
import HistoryTable from "./../components/historyTable";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Transaction({ docs }) {
  const [transactions, setTransactions] = useState([]);
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: "selection",
    },
  ]);
  useEffect(() => {
    const [{ startDate, endDate }] = state;

    const most = new Date(
      new Date(endDate.toDateString()).setHours(23, 59, 59, 59)
    ).getTime();
    const least = new Date(
      new Date(startDate.toDateString()).setHours(0, 0, 0, 0)
    ).getTime();

    axios
      .get(`/api/history?most=${most}&least=${least}`)
      .then(({ data: { docs } }) => {
        setTransactions(docs);
      })
      .catch(console.log);
  }, [state]);

  return (
    <Layout>
      <DateRangePicker
        onChange={(item) => setState([item.selection])}
        showSelectionPreview={true}
        moveRangeOnFirstSelection={false}
        months={1}
        ranges={state}
        direction="vertical"
        scroll={{ enabled: true }}
        maxDate={new Date()}
        minDate={docs?.date ? new Date(docs.date) : new Date()}
      />
      <Chart items={transactions} />
      <HistoryTable data={transactions} />
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const { user } = getSession(ctx.req, ctx.res);
  const { db } = await connectToDatabase();
  const [docs] = await db
    .collection("transactions")
    .aggregate([
      {
        $match: {
          creator: user.sub,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
      {
        $limit: 1,
      },
    ])
    .toArray();

  return {
    props: {
      user,
      docs: JSON.parse(JSON.stringify(docs)),
    },
  };
}

function Chart({ items }) {
  const data = items.map((item) => ({
    ...item,
    amount: item.type === "in" ? item.amount : -item.amount,
  }));
  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.amount));
    const dataMin = Math.min(...data.map((i) => i.amount));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  };
  const off = gradientOffset();
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        width={"100%"}
        height={400}
        data={data}
        margin={{
          top: 10,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="item" />
        <YAxis />
        <Tooltip />
        <defs>
          <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset={off} stopColor="green" stopOpacity={0.5} />
            <stop offset={off} stopColor="red" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#000"
          fill="url(#splitColor)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
