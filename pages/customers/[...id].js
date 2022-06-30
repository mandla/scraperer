import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./../../components/Layout";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import ShareIcon from "@material-ui/icons/Share";
import { connectToDatabase } from "./../../utils/db";
import { ObjectId } from "mongodb";
import { getSession } from "@auth0/nextjs-auth0";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function CheckboxList({ id, customer, user }) {
  const [uniqueDebt, setUniqueDebt] = useState([]);
  const [update, setUpdate] = useState({});
  const classes = useStyles();

  useEffect(() => {
    console.log(id);
    axios
      .get(`/api/debt?id=${id}`)
      .then(({ data: { docs } }) => {
        setUniqueDebt(
          docs
            .filter((d) => d._id === "in" || d._id === "out")
            .reduce((acc, curr) => {
              return [...acc, ...curr.items];
            }, [])
        );
      })
      .catch(console.log);
  }, [update]);

  function resolve(state) {
    const objId = state._id;
    delete state._id;
    axios
      .post("/api/transactions", {
        ...state,
        date: new Date().getTime(),
      })
      .then(async () => {
        await axios.put("/api/debt?id=" + objId, { ...state });
        setUpdate((u) => ({ ...u, type: "get" }));
      })
      .catch(console.log);
  }
  function shareLocal(obj) {
    const shareData = {
      title: "Kippa",
      text: `Hey! ${customer.name}, you owe ${user.name}  ${
        obj.amount
      } naira due on ${new Date(obj.date).toDateString()} for ${
        obj.item
      }. You can see more details at : `,
      url: `${window.location.origin}/debt/${obj._id}`,
    };
    navigator.share(shareData).then(console.log).catch(console.log);
  }
  return (
    <Layout>
      <h3>{customer.name}</h3>
      <p>
        Total{" "}
        {new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(
          uniqueDebt.reduce((acc, curr) => {
            return curr.type === "in"
              ? (acc += curr.amount)
              : (acc -= curr.amount);
          }, 0)
        )}
      </p>
      <List className={classes.root}>
        {uniqueDebt.length > 0 &&
          uniqueDebt.map((u) => (
            <ListItem key={u._id}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": u.item }}
                  onChange={() => resolve(u)}
                />
              </ListItemIcon>
              <ListItemText
                id={u._id}
                primary={u.item}
                secondary={`Due on ${new Date(u.date).toDateString()}`}
              />
              {u.type === "in" && (
                <ListItemSecondaryAction onClick={() => shareLocal(u)}>
                  <IconButton edge="end" aria-label="comments">
                    <ShareIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
      </List>
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const id = typeof ctx.query.id === "object" ? ctx.query.id[0] : ctx.query.id;
  const { user } = getSession(ctx.req, ctx.res);
  const { db } = await connectToDatabase();

  const customer = await db
    .collection("customers")
    .findOne({ _id: ObjectId(id) });

  return {
    props: {
      id,
      customer: JSON.parse(JSON.stringify(customer)),
      user,
    },
  };
}
