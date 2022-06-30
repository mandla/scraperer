import Link from "next/link";

import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import PeopleIcon from "@material-ui/icons/People";
import HistoryIcon from "@material-ui/icons/History";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function Navbar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              width: "100%",
            }}
          >
            <Typography variant="h6" className={classes.title} align="center">
              <Link href="/account">
                <a style={{ color: "#fff", textDecoration: "none" }}>Account</a>
              </Link>
            </Typography>
            <Typography variant="h6" className={classes.title} align="center">
              <Link href="/customers">
                <a style={{ color: "#fff", textDecoration: "none" }}>
                  Customers
                </a>
              </Link>
            </Typography>

            <Typography variant="h6" className={classes.title} align="center">
              <Link href="/transactions">
                <a style={{ color: "#fff", textDecoration: "none" }}>History</a>
              </Link>
            </Typography>
            <Typography variant="h6" className={classes.title} align="center">
              <a
                style={{ color: "#fff", textDecoration: "none" }}
                href="/api/auth/logout"
              >
                Logout
              </a>
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}
