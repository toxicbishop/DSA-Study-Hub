import { useEffect } from "react";
import { useRouter } from "next/router";
import { secureFetch } from "../utils/api";
import Loader from "../components/Loader";

export function AuthCallbackView() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    
    const code = router.query.code as string;

    if (code) {
      secureFetch(`/api/proxy/auth/github`, {
        method: "POST",
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            window.location.href = "/";
          } else {
            console.error(data.message);
            router.push("/");
          }
        })
        .catch((err) => {
          console.error("GitHub auth failed", err);
          router.push("/");
        });
    } else if (router.isReady && !router.query.code) {
       // if it's ready and no code, just go home
       // router.push("/");
    }
  }, [router]);



  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Authenticating with GitHub...
      </h2>
      <Loader />
    </div>
  );
}
