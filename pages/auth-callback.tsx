// Next.js page for Auth Callback
import { AuthCallbackView } from '../src/views/AuthCallbackView';
import { SEO } from '../src/components/SEO';

export default function AuthCallback() {
  return (
    <>
      <SEO title="Authenticating..." description="Authenticating with DSA Study Hub" noindex />
      <AuthCallbackView />
    </>
  );
}
