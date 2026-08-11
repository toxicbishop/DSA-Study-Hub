import { ProfileView } from '../src/views/ProfileView';
import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import { GoogleUser } from '../src/components/GoogleAuth';

export default function Profile({ user }: { user: GoogleUser | null }) {
  return <ProfileView user={user} onUpdate={() => {}} />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const cookies = parseCookies(context);
  let user = null;
  try {
    const res = await fetch(`${process.env.API_URL || "http://localhost:5001"}/api/users/me`, {
      headers: {
        cookie: context.req.headers.cookie || "",
        "X-XSRF-TOKEN": cookies["XSRF-TOKEN"] || "",
      },
      credentials: "include",
    });
    if (res.ok) {
      user = await res.json();
    }
  } catch {
    // ignore
  }
  return {
    props: { user },
  };
}
