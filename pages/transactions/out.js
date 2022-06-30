import { useRouter } from "next/router";
import axios from "axios";
import Layout from "./../../components/Layout";
import React from "react";
import TextField from "@material-ui/core/TextField";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import { Button } from "@material-ui/core";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles } from "@material-ui/core/styles";

const data = [
  "advertising",
  "maintenance",
  "services",
  "freight",
  "insurance",
  "compensation",
  "entertainment",
];
const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));
export default function Create() {
  const classes = useStyles();
  const router = useRouter();
  function createOut(e) {
    e.preventDefault();
    const state = Object.fromEntries(new FormData(e.target));

    axios
      .post("/api/transactions", {
        ...state,
        date: new Date().getTime(),
        amount: parseFloat(state.amount),
        type: "out",
      })
      .then(() => {
        router.push("/account");
      })
      .catch(console.log);
  }
  return (
    <Layout>
      <h3>Record Money out</h3>
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
          <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-helper-label">
              Category
            </InputLabel>
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              name="category"
              fullWidth
            >
              {data.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select Category</FormHelperText>
          </FormControl>
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
