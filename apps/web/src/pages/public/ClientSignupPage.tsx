import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClientRegistrationSuccessModal } from '../../components/marketing/ClientRegistrationSuccessModal';
import { SplitLoginLayout } from '../../components/marketing/SplitLoginLayout';
import { SplitLoginPanel } from '../../components/marketing/SplitLoginPanel';
import { ClientSignupForm } from '../../components/marketing/ClientSignupForm';
import { PageMeta } from '../../components/PageMeta';
import { CLIENT_LOGIN_PATH } from '../../lib/login-portals';

export function ClientSignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const discipline = searchParams.get('discipline');
  const successPath =
    discipline != null && discipline !== ''
      ? `${CLIENT_LOGIN_PATH}/signup/success?discipline=${encodeURIComponent(discipline)}`
      : `${CLIENT_LOGIN_PATH}/signup/success`;

  return (
    <>
      <PageMeta
        title="Sign Up | BesTal Client Portal"
        description="Register your company for BesTal client access."
        noIndex
      />
      <SplitLoginLayout>
        <SplitLoginPanel brandHref="/">
          <ClientSignupForm
            discipline={discipline}
            onSuccess={() => navigate(successPath)}
          />
        </SplitLoginPanel>
      </SplitLoginLayout>
    </>
  );
}

export function ClientSignupSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const discipline = searchParams.get('discipline');
  const loginHref =
    discipline != null && discipline !== ''
      ? `${CLIENT_LOGIN_PATH}?discipline=${encodeURIComponent(discipline)}`
      : CLIENT_LOGIN_PATH;

  function handleClose() {
    navigate(loginHref, { replace: true });
  }

  return (
    <>
      <PageMeta
        title="Registration Received | BesTal"
        description="Your BesTal client registration is pending activation."
        noIndex
      />
      <ClientRegistrationSuccessModal onClose={handleClose} />
    </>
  );
}
