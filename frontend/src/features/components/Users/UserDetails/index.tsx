import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SquarePen, Check, X, Building2, MoreVertical, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import userService from '@/utils/services/user';
import { userSchema, userUpdateSchema } from '@/features/components/Users/utils';
import { toast } from '@/components/ui/sonner';
import type { User as UserType } from '@/types';
import type { FieldProps } from '@/types';

const formatFieldName = (field: string) =>
  field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

const extractErrorMessage = (error: any) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  'An unknown error occurred.';

type UpdateResponse = UserType | { statusCode: number; message?: string };

const useUser = (userId: string | undefined, navigate: ReturnType<typeof useNavigate>) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!userId) {
      setError('User ID is missing.');
      setIsLoading(false);
      setTimeout(() => navigate('/setting/users', { replace: true }), 1000);
      return;
    }

    const fetchUser = async () => {
      try {
        const latestUser = await userService.getById(userId);
        const parsedResult = userSchema
          .omit({ password: true, status: true })
          .safeParse(latestUser);
        if (parsedResult.success) {
          setUser(parsedResult.data as UserType);
        } else {
          throw new Error('Invalid user data: ');
        }
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(`${errorMessage} Redirecting...`);
        setTimeout(() => navigate('/setting/users', { replace: true }), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate]);

  const updateUser = async (field: keyof UserType, value: string | string[]) => {
    if (!user) return;
    const updatedData: Partial<UserType> = { [field]: value };
    try {
      userUpdateSchema.parse(updatedData);
      setIsSaving(true);
      const res = (await userService.update(user.id ?? '', updatedData)) as UpdateResponse;
      if ('id' in res || ('statusCode' in res && [200, 204].includes(res.statusCode))) {
        setUser({ ...user, [field]: value });
        return `${formatFieldName(field)} updated successfully.`;
      }
      throw new Error(res.message || 'Update failed.');
    } catch (error: any) {
      const errorMessage =
        error instanceof z.ZodError
          ? error.issues
              .map((e) => `${formatFieldName(e.path[0] as string)}: ${e.message}`)
              .join(', ')
          : extractErrorMessage(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await userService.delete(user.id || '');
      navigate('/setting/users');
      return `${user.firstName} ${user.lastName} deleted successfully.`;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return { user, error, isLoading, isSaving, isDeleting, updateUser, deleteUser, setError };
};

const Field: React.FC<FieldProps> = ({
  label,
  value,
  fieldKey,
  isEditable,
  isEditing,
  tempValue,
  onEdit,
  onSave,
  onCancel,
  onTempChange,
}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center py-0 px-0 sm:px-0 border-b border-gray-400 last:border-b-0">
    <span className="text-gray-500 text-sm sm:text-xs w-full sm:w-[130px] font-medium pr-4 mb-1 sm:mb-0">
      {label}
    </span>
    <div className="flex-1 min-w-0">
      {isEditing ? (
        <div className="flex items-center gap-0.5 w-full">
          {fieldKey === 'roles' ? (
            <Select
              value={Array.isArray(tempValue) ? tempValue[0] : tempValue}
              onValueChange={(value) => onTempChange([value])}
            >
              <SelectTrigger className="border-2 border-blue-300 focus:ring-blue-500 rounded-sm px-2 py-0.5 text-sm h-6">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <input
              className="border-1 border-blue-300 bg-white rounded-sm px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 flex-grow min-w-0 h-6"
              value={typeof tempValue === 'string' ? tempValue : ''}
              onChange={(e) => onTempChange(e.target.value)}
              autoFocus
            />
          )}
          <button
            onClick={onSave}
            className="text-green-600 hover:bg-green-100 rounded p-0.5 transition h-6 flex items-center justify-center flex-shrink-0 cursor-pointer"
            aria-label={`Save ${label}`}
          >
            <Check size={16} />
          </button>
          <button
            onClick={onCancel}
            className="text-red-500 hover:bg-red-100 rounded p-0.5 transition h-6 flex items-center justify-center flex-shrink-0 cursor-pointer"
            aria-label={`Cancel ${label}`}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`flex items-center justify-between gap-1 group relative w-full ${isEditable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          onClick={isEditable ? onEdit : undefined}
        >
          <span
            className={`text-gray-800 text-sm break-words py-0.5 pr-2 truncate ${isEditable ? 'group-hover:text-blue-600' : ''}`}
          >
            {Array.isArray(value) ? value.join(', ') : (value ?? '—')}
          </span>
          <span className="flex-shrink-0 p-0.5">
            <SquarePen
              size={12}
              className={
                isEditable
                  ? 'text-gray-500 hover:text-blue-500 transition-colors cursor-pointer'
                  : 'text-gray-300 cursor-default'
              }
              onClick={(e) => isEditable && (e.stopPropagation(), onEdit())}
            />
          </span>
        </div>
      )}
    </div>
  </div>
);

const UserDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user, error, isLoading, isSaving, isDeleting, updateUser, deleteUser, setError } =
    useUser(userId, navigate);
  const [editState, setEditState] = useState<{
    field: keyof UserType | null;
    value: string | string[];
  }>({
    field: null,
    value: '',
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fields = Object.keys(userSchema.shape)
    .filter((key) => key !== 'id' && key !== 'password' && key !== 'status')
    .map((key) => ({
      key: key as keyof UserType,
      label: formatFieldName(key),
      isEditable: key !== 'email' && key !== 'roles',
    }));

  const midIndex = Math.ceil(fields.length / 2);
  const [leftFields, rightFields] = [fields.slice(0, midIndex), fields.slice(midIndex)];

  const handleEdit = (field: keyof UserType) => {
    if (user) {
      setEditState({
        field,
        value: field === 'roles' ? (user[field] ?? ['USER']) : (user[field]?.toString() ?? ''),
      });
    }
  };

  const handleSave = () => {
    if (!editState.field || !user) return;
    toast.promise(updateUser(editState.field, editState.value), {
      loading: `Updating ${formatFieldName(editState.field)}...`,
      success: (message) => (setEditState({ field: null, value: '' }), message),
      error: (err) => err.message,
    });
  };

  const handleCancel = () => {
    setEditState({ field: null, value: '' });
    setError(null);
  };

  const handleDelete = () => {
    toast.promise(deleteUser(), {
      loading: `Deleting ${user?.firstName} ${user?.lastName}...`,
      success: (message) => (setIsDeleteModalOpen(false), message),
      error: (err) => err.message,
    });
  };

  if (isLoading)
    return <div className="text-center p-8 text-gray-600">Loading user details...</div>;
  if (error && !user)
    return (
      <div className="text-center p-4 text-red-500">
        <p>{error}</p>
        <Button variant="outline" onClick={() => navigate('/setting/users')} className="mt-4">
          Go Back to Users
        </Button>
      </div>
    );
  if (!user) return null;

  return (
    <div className="w-full h-full">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto p-4 sm:px-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-xs text-gray-500 flex items-center mb-1">
                <Building2 size={12} className="mr-1" />
                Account
              </div>
              <h1 className="text-2xl font-normal">{`${user.firstName} ${user.middleName || ''} ${user.lastName} - Details`}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 cursor-pointer"
                    disabled={isDeleting || isSaving}
                    aria-label="More actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => user && userId && navigate(`/setting/Users/edit/${userId}`)}
                    className="cursor-pointer"
                  >
                    <SquarePen size={16} className="mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-red-500 cursor-pointer"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="w-7xl mx-auto p-4 sm:p-6 w-full bg-gray-100">
        <div className="min-h-[600px] flex flex-col w-full">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="bg-white rounded-md shadow-md mb-6 w-full">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                {[leftFields, rightFields].map((columnFields, idx) => (
                  <div key={idx} className="space-y-2">
                    {columnFields.map(({ key, label, isEditable }) => (
                      <Field
                        key={key}
                        label={label}
                        value={user[key]}
                        fieldKey={key}
                        isEditable={isEditable}
                        isEditing={editState.field === key}
                        tempValue={editState.value}
                        onEdit={() => handleEdit(key)}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onTempChange={(value) => setEditState({ ...editState, value })}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="sm:max-w-[425px] bg-white border-gray-300">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserDetailView;
