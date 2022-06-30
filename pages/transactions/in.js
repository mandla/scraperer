import axios from "axios";
import { useRouter } from "next/router";
import Layout from "./../../components/Layout";
import React from "react";
import TextField from "@material-ui/core/TextField";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import { Button } from "@material-ui/core";

export default function In() {
  const router = useRouter();
  function createOut(e) {
    e.preventDefault();
    const state = Object.fromEntries(new FormData(e.target));

    axios
      .post("/api/transactions", {
        ...state,
        date: Date.now(),
        sum: parseFloat(state.amount),
        type: "in",
        quantity: parseInt(state.quantity),
        amount: parseFloat(state.amount) * parseInt(state.quantity),
      })
      .then(() => {
        router.push("/account");
      })
      .catch(console.log);
  }
  return (
    <Layout>
      <h3>Record a new Sale</h3>
      <form onSubmit={createOut}>
        <div>
          <TextField id="standard-basic" label="Item" name="item" fullWidth />
        </div>
        <div>
          <TextField
            id="standard-number"
            label="Amount"
            type="number"
            name="amount"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
        </div>
        <div>
          <TextField
            id="standard-number"
            label="Quantity"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            name="quantity"
            fullWidth
          />
        </div>
        <FormControl component="fieldset">
          <FormLabel component="legend">Payment Method</FormLabel>
          <RadioGroup aria-label="method" name="method" row>
            <FormControlLabel value="cash" control={<Radio />} label="cash" />
            <FormControlLabel value="pos" control={<Radio />} label="pos" />
            <FormControlLabel
              value="transfer"
              control={<Radio />}
              label="transfer"
            />
          </RadioGroup>
        </FormControl>
        <div>
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
        </div>
      </form>
    </Layout>
  );
}
