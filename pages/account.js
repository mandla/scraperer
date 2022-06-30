import { getSession } from "@auth0/nextjs-auth0";
import { connectToDatabase } from "./../utils/db";
import Monthly from "../components/monthly";
import Mlink from "@material-ui/core/Link";
import Layout from "./../components/Layout";
import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Table from "./../components/table";
import Typography from "@material-ui/core/Typography";

export default function Account({ user, docs }) {
  const [{ overview, dailySummary, byCategory }] = docs;

  return (
    <Layout>
      <div>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography align="center">
              Total Balance <br />
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(
                overview.reduce((a, doc) => {
                  if (doc._id === "in") a = a + doc.total;
                  if (doc._id === "out") a = a - doc.total;
                  return a;
                }, 0)
              )}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography align="center">
              <span>Daily Balance </span> <br />
              <span>
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                }).format(
                  dailySummary.reduce((a, doc) => {
                    if (doc._id === "in") a = a + doc.total;
                    if (doc._id === "out") a = a - doc.total;
                    return a;
                  }, 0)
                )}
              </span>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Monthly categories={byCategory} />
          </Grid>
          <Grid item xs={6}>
            <Typography align="center">
              <Button variant="contained" color="secondary">
                <Mlink href="/transactions/out" color="inherit">
                  Money Out
                </Mlink>
              </Button>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography align="center">
              <Button variant="contained" color="primary">
                <Mlink href="/transactions/in" color="inherit">
                  Money In
                </Mlink>
              </Button>
            </Typography>
          </Grid>
          <Grid item xs={12}></Grid>
          <Grid item xs={12}>
            <Table
              daily={dailySummary}
              data={dailySummary
                .filter((d) => d._id === "in" || d._id === "out")
                .reduce((acc, curr) => {
                  return [...acc, ...curr.items];
                }, [])}
            />
          </Grid>
        </Grid>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const { user } = getSession(ctx.req, ctx.res);
  const { db } = await connectToDatabase();
  const docs = await db
    .collection("transactions")
    .aggregate([
      {
        $match: {
          creator: user.sub,
        },
      },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: "$type",
                total: { $sum: "$amount" },
              },
            },
          ],
          dailySummary: [
            {
              $match: {
                date: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
                },
              },
            },
            {
              $group: {
                _id: "$type",
                total: { $sum: "$amount" },
                items: { $push: "$$ROOT" },
              },
            },
          ],
          byCategory: [
            {
              $group: {
                _id: "$category",
                total: { $sum: "$amount" },
              },
            },
          ],
        },
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
