import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAuthToken } from '@/utils';

export default function MicrosoftCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('token');
    if (accessToken) {
      setAuthToken(accessToken);

      navigate('/apps', { replace: true });
    } else {
      console.error('Microsoft login failed: No access token found.');
      navigate('/', { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div>
      <p>Processing Microsoft login...</p>
    </div>
  );
}
