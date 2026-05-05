import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import api from '@/lib/api';

export default function QrAnimalRedirectPage() {
  const { token } = useParams<{ token: string }>();
  const [animalId, setAnimalId] = useState<number | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;

    api.get(`/animals/uid/${token}`)
      .then((res) => setAnimalId(res.data.id))
      .catch(() => setNotFound(true));
  }, [token]);

  if (animalId) {
    return <Navigate to={`/animals/${animalId}`} replace />;
  }

  if (notFound) {
    return (
      <div className="page-shell">
        <div className="empty-state glass-card">
          <QrCode size={42} style={{ color: 'var(--rose)' }} />
          <p className="text-xl font-bold text-white">Animal record not found</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>The QR code is invalid or you do not have access to this animal record.</p>
        </div>
      </div>
    );
  }

  return <div className="flex justify-center py-20"><div className="spinner" /></div>;
}
