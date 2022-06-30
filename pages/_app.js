import "../styles/globals.css";
import Head from "next/head";

import { UserProvider } from "@auth0/nextjs-auth0";

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Head>
        <title>Kippa Clone</title>
      </Head>
      <Component {...pageProps} />
    </UserProvider>
  );
}
