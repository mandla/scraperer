import { useUser } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Index() {
  const { user, isLoading } = useUser();

  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !user) {
      if (!user) router.push("/api/auth/login");
    }
    if (!isLoading && user) {
      if (user) router.push("/account");
    }
  }, [isLoading]);

  return null;
}
