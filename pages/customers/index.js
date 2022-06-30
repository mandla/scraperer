import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import Link from "next/link";
import Layout from "./../../components/Layout";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ImageIcon from "@material-ui/icons/Image";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

import { Button } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function FolderList() {
  const [customers, setCustomers] = useState([]);
  const [update, setUpdate] = useState({});
  const [phone, setPhone] = useState();
  const [balance, setbalance] = useState(0);
  function handleSubmit(e) {
    e.preventDefault();
    const state = Object.fromEntries(new FormData(e.target));

    axios
      .post("/api/customers", { ...state, phone })
      .then(() => {
        setUpdate((u) => ({ ...u, type: "get" }));
      })
      .catch(console.log);
  }
  useEffect(() => {
    axios
      .get("/api/customers")
      .then(({ data: { docs } }) => {
        let num = 0;
        for (const { debt } of docs) {
          debt.forEach((d) => {
            if (d.type === "in") num += d.amount;
            if (d.type === "out") num -= d.amount;
          });
        }

        setbalance(num);
        setCustomers(docs);
      })
      .catch(console.log);
  }, [update]);

  return (
    <Layout>
      <h3>Customers</h3>
      <p>
        Total {"  "}
        {new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(balance)}
      </p>
      <List>
        {customers.map((c) => (
          <CustomerItem c={c} key={c._id} updateState={setUpdate} />
        ))}
      </List>
      <h3>Create New Customer</h3>
      <form onSubmit={handleSubmit}>
        <TextField
          id="standard-uncontrolled"
          label="Customer's Name"
          defaultValue=""
          name="name"
          fullWidth
        />
        <div>
          <div className="label" style={{ margin: "1rem 0px" }}>
            Mobile Number
          </div>
          <PhoneInput
            country={"us"}
            value={phone}
            onChange={(e) => setPhone(e)}
          />
        </div>
        <div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ margin: "1rem 0px" }}
          >
            Save
          </Button>
        </div>
      </form>
    </Layout>
  );
}

function CreateDebt({ customer, setUpdate, closeTransaction }) {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState(1);
  const [selectVal, setSelectVal] = useState("in");

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  function handleDebt(e) {
    e.preventDefault();
    const state = {
      type: selectVal,
      item,
      amount: parseFloat(amount),
      customer: customer._id,
      date: new Date(new Date(selectedDate).setHours(0, 0, 0, 0)).getTime(),
    };
    if (state.type === "out") state.category = "debit";
    axios
      .post("/api/debt", { ...state })
      .then(({ data: { doc } }) => {
        setUpdate((u) => ({ ...u, type: "get" }));
        closeTransaction();
      })
      .catch(console.log);
  }
  return (
    <form onSubmit={handleDebt}>
      <FormControl className={classes.formControl} fullWidth>
        <InputLabel id="demo-simple-select-helper-label">Type</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={selectVal}
          onChange={(e) => setSelectVal(e.target.value)}
        >
          <MenuItem value="in">Credit</MenuItem>
          <MenuItem value="out">Debit</MenuItem>
        </Select>
        <FormHelperText>Select type of transaction</FormHelperText>
      </FormControl>
      <br />
      <TextField
        id="standard-basic"
        label="Items Bought"
        onChange={(e) => setItem(e.target.value)}
        value={item}
        fullWidth
      />{" "}
      <br />
      <TextField
        id="standard-number"
        label="Amount"
        min="1"
        type="number"
        InputLabelProps={{
          shrink: true,
        }}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
      />{" "}
      <br />
      <MuiPickersUtilsProvider utils={DateFnsUtils} fullWidth>
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline"
          label="Select Due Date"
          value={selectedDate}
          onChange={handleDateChange}
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
          fullWidth
        />
      </MuiPickersUtilsProvider>
      <div>
        <Button type="submit" variant="contained" color="primary">
          Save
        </Button>
      </div>
    </form>
  );
}

function CustomerItem({ c, updateState }) {
  const [showTransaction, setShowTransaction] = useState(false);

  return (
    <>
      <ListItem button>
        <ListItemAvatar>
          <Avatar>
            <Link href={`/customers/${c._id}`}>
              <a>
                <ImageIcon />
              </a>
            </Link>
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={c.name} />

        <Button
          onClick={() => setShowTransaction(!showTransaction)}
          variant="contained"
          color="primary"
        >
          Record Debt
        </Button>
      </ListItem>
      {showTransaction && (
        <CreateDebt
          customer={c}
          setUpdate={updateState}
          closeTransaction={() => setShowTransaction(!showTransaction)}
        />
      )}
    </>
  );
}
