import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormPageLayoutProps {
  title: string;
  cardTitle: string;
  backPath: string;
  filledCount?: number;
  totalCount?: number;
  error: string | null;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  actionArea: React.ReactNode;
}

export default function FormPageLayout({
  title,
  cardTitle,
  backPath,
  filledCount,
  totalCount,
  error,
  children,
  onSubmit,
  actionArea,
}: FormPageLayoutProps) {
  const navigate = useNavigate();

  const showFieldCount = filledCount !== undefined && totalCount !== undefined;

  return (
    <div className="flex-1 space-y-4 p-2 md:p-4 lg:p-6">
      <div className="flex items-center justify-between pb-2 mb-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <Button
          variant="outline"
          onClick={() => navigate(backPath)}
          className="text-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold border-b pb-4">
            {cardTitle}
            {showFieldCount && (
              <>
                {' '}
                ({filledCount}/{totalCount} fields filled)
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4">{children}</div>
            <div className="pt-4 flex justify-end">{actionArea}</div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
