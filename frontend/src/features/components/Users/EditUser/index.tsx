import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Save, Loader2 } from 'lucide-react';
import FormPageLayout from '@/features/components/form-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import userService from '@/utils/services/user';
import { userUpdateSchema, type User, userSchema } from '@/features/components/Users/utils';
import { toast } from '@/components/ui/sonner';

const formatFieldName = (field: string): string => {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

const extractErrorMessage = (error: any): string => {
  const backendMessage = error.response?.data?.message || error.response?.data?.error;
  if (backendMessage && typeof backendMessage === 'string' && backendMessage.trim() !== '') {
    return backendMessage;
  }
  if (error.message && typeof error.message === 'string' && error.message.trim() !== '') {
    return error.message;
  }
  return 'An unknown error occurred.';
};

const userViewSchema = userSchema.omit({ password: true, status: true });

const formEditableKeys: (keyof User)[] = Object.keys(userViewSchema.shape)
  .filter((key) => key !== 'id' && key !== 'email' && key !== 'roles')
  .map((key) => key as keyof User);

const formRenderKeys: (keyof User)[] = ['email', 'roles', ...formEditableKeys];

const cleanUpdatePayload = (data: Partial<User>, originalUser: User): Partial<User> => {
  const dataToSend: Partial<User> = {};
  formEditableKeys.forEach((key) => {
    let formValue = data[key];

    let canonicalValue: string | null | undefined = formValue as string | null | undefined;
    if (key === 'middleName' || key === 'phoneNo') {
      canonicalValue =
        formValue === null || formValue === undefined || formValue === ''
          ? null
          : (formValue as string);
    } else if (canonicalValue === null || canonicalValue === undefined) {
      if (formValue === null) {
        canonicalValue = undefined;
      }
    }

    const originalValueRaw = originalUser[key];

    let originalCanonical: string | null | undefined = originalValueRaw as
      | string
      | null
      | undefined;
    if (originalCanonical === '' || originalCanonical === undefined) {
      originalCanonical = null;
    }

    if (canonicalValue !== originalCanonical) {
      if (canonicalValue !== undefined) {
        dataToSend[key] = canonicalValue as any;
      }
    }
  });

  return dataToSend;
};

const UserEditForm: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backPath = userId ? `/setting/users/${userId}` : '/setting/users';

  useEffect(() => {
    if (!userId) {
      setError('User ID is missing from the URL.');
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const latestUser = await userService.getById(userId);

        const parsedResult = userViewSchema.safeParse(latestUser);

        if (parsedResult.success) {
          const fetchedUser = parsedResult.data as User;
          setUser(fetchedUser);
          const initialFormData: Partial<User> = {};
          formEditableKeys.forEach((key) => {
            const value = fetchedUser[key];
            initialFormData[key] = value === null || value === undefined ? '' : (value as any);
          });
          setFormData(initialFormData);
        } else {
          const zodError = parsedResult.error;
          const errorDetails = zodError.issues
            .map((issue) => `${formatFieldName(issue.path[0] as string)}: ${issue.message}`)
            .join('; ');

          setError('Fetched user data is invalid. Schema error(s): ' + errorDetails);
        }
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(`Failed to load user details: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || isSaving) return;

    const dataToSend = cleanUpdatePayload(formData, user);

    if (Object.keys(dataToSend).length === 0) {
      toast.info('No changes detected to save.');
      return;
    }

    try {
      userUpdateSchema.parse(dataToSend);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const validationError = error.issues
          .map((e) => `${formatFieldName(e.path[0] as string)}: ${e.message}`)
          .join(', ');
        setError('Validation failed: ' + validationError);
      } else {
        setError('A validation error occurred.');
      }
      return;
    }

    setIsSaving(true);

    const updatePromise = userService
      .update(user.id || '', dataToSend)
      .then((res: any) => {
        if (res && (res.statusCode === 200 || res.statusCode === 204 || res.id)) {
          navigate(backPath);
          return { message: `${user.firstName}'s account updated successfully.` };
        } else {
          throw new Error(res.message || 'Update failed with unknown status.');
        }
      })
      .catch((error: any) => {
        const errorMessage = extractErrorMessage(error);
        setError(errorMessage);
        throw new Error(errorMessage);
      })
      .finally(() => {
        setIsSaving(false);
      });

    toast.promise(updatePromise, {
      loading: `Saving changes for ${user.firstName}...`,
      success: (data: { message: string }) => data.message,
      error: (err) => err.message,
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-6 text-center">
        <p className="text-gray-600">Loading user data for editing...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex-1 space-y-4 p-6 text-center text-red-500">
        <p>{error}</p>
        <Button onClick={() => navigate('/setting/users')}>Go Back</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 space-y-4 p-6 text-center text-red-500">
        <p>Could not load user data.</p>
      </div>
    );
  }

  return (
    <FormPageLayout
      title={`Edit User: ${user.firstName} ${user.lastName}`}
      cardTitle="User Information"
      backPath={backPath}
      error={error}
      onSubmit={handleSubmit}
      actionArea={
        <Button className="cursor-pointer" type="submit" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      }
    >
      {formRenderKeys.map((key) => {
        const label = formatFieldName(key);
        const isEmail = key === 'email';
        const isRoles = key === 'roles';
        const isDisabled = isEmail || isRoles;

        if (isRoles) {
          return (
            <div className="space-y-2" key={key}>
              <Label htmlFor={key}>{label}</Label>
              <div className="flex items-center w-full">
                <Input
                  id={key}
                  name={key}
                  value={(user[key] as string[])?.join(', ') || ''}
                  disabled={true}
                  className="cursor-not-allowed bg-gray-100 border-gray-300 focus-visible:ring-0 w-full"
                  readOnly
                />
              </div>
            </div>
          );
        }

        const type = key === 'phoneNo' ? 'tel' : isEmail ? 'email' : 'text';
        const value = isEmail ? user.email : formData[key] || '';

        return (
          <div className="space-y-2" key={key}>
            <Label htmlFor={key}>{label}</Label>
            <div className="flex items-center w-full">
              <Input
                id={key}
                name={key}
                type={type}
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                disabled={isDisabled}
                className={
                  isDisabled
                    ? 'cursor-not-allowed bg-gray-100 border-gray-300 focus-visible:ring-0 w-full'
                    : 'focus-visible:ring-0 w-full'
                }
              />
            </div>
          </div>
        );
      })}
    </FormPageLayout>
  );
};

export default UserEditForm;
