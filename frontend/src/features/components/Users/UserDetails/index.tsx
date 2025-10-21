import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SquarePen, Check, X, Building2 } from 'lucide-react';

import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import userService from '@/utils/services/user';
import { userSchema, userUpdateSchema, type User } from '@/features/components/Users/utils';
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
    return 'An unknown error occurred. Please check the console.';
};

interface DetailFieldProps {
  label: string;
  value: string | null | undefined;
  fieldKey: keyof User;
  isEditable: boolean;
  isEditing: boolean;
  tempValue: string;
  onEdit: (field: keyof User) => void;
  onSave: () => void;
  onCancel: () => void;
  onTempChange: (value: string) => void;
}

const DetailField: React.FC<DetailFieldProps> = ({
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
}) => {
  const userFieldKey = fieldKey;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-0 px-0 sm:px-0 border-b border-gray-400 last:border-b-0">
      <span className="text-gray-500 text-sm sm:text-xs w-full sm:w-[130px] font-medium pr-4 mb-1 sm:mb-0">
        {label}
      </span>
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-0.5 w-full">
            <input
              className="border-1 border-blue-300 bg-white rounded-sm px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 flex-grow min-w-0 h-6"
              value={tempValue}
              onChange={(e) => onTempChange(e.target.value)}
              autoFocus
            />
            <button
              onClick={onSave}
              className="text-green-600 hover:bg-green-100 rounded p-0.5 transition h-6 flex items-center justify-center flex-shrink-0"
              aria-label={`Save ${label}`}
            >
              <Check size={16} />
            </button>
            <button
              onClick={onCancel}
              className="text-red-500 hover:bg-red-100 rounded p-0.5 transition h-6 flex items-center justify-center flex-shrink-0"
              aria-label={`Cancel ${label}`}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center justify-between gap-1 group relative w-full ${
              isEditable ? 'cursor-pointer' : 'cursor-not-allowed'
            }`}
            onClick={() => isEditable && onEdit(userFieldKey)}
          >
            <span
              className={`text-gray-800 text-sm break-words py-0.5 pr-2 truncate ${
                isEditable ? 'group-hover:text-blue-600' : ''
              }`}
            >
              {value === null || value === undefined || value === '' ? '—' : value}
            </span>
            <span className="flex-shrink-0 p-0.5">
              <SquarePen
                size={12}
                className={
                  isEditable
                    ? 'text-gray-500 hover:text-blue-500 transition-colors cursor-pointer'
                    : 'text-gray-300 cursor-default'
                }
                onClick={(e) => {
                  if (isEditable) {
                    e.stopPropagation();
                    onEdit(userFieldKey);
                  }
                }}
              />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
interface RoleFieldProps {
  label: string;
  value: string | null | undefined;
  isEditing: boolean;
  tempValue: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTempChange: (value: string) => void;
}


const RoleField: React.FC<RoleFieldProps> = ({
  label,
  value,
  isEditing,
  tempValue,
  onEdit,
  onSave,
  onCancel,
  onTempChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-0 px-0 sm:px-0 border-b border-gray-400 last:border-b-0">
      <span className="text-gray-500 text-sm sm:text-xs w-full sm:w-[130px] font-medium pr-4 mb-1 sm:mb-0">
        {label}
      </span>
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-0.5 w-full">
            <Select value={tempValue} onValueChange={onTempChange}>
              <SelectTrigger className="border-2 border-blue-300  focus:ring-blue-500 rounded-sm px-2 py-0.5 text-sm h-6">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={onSave}
              className="text-green-600 hover:bg-green-100 rounded p-0.5 transition h-6 flex items-center justify-center flex-shrink-0"
              aria-label={`Save ${label}`}
            >
              <Check size={16} />
            </button>
            <button
              onClick={onCancel}
              className="text-red-500 hover:bg-red-100 rounded p-0.5 transition h-6 flex items-center justify-center flex-shrink-0"
              aria-label={`Cancel ${label}`}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center justify-between gap-1 group relative w-full cursor-pointer"
            onClick={onEdit}
          >
            <span className="text-gray-800 text-sm break-words py-0.5 pr-2 truncate group-hover:text-blue-600">
              {value || '—'}
            </span>
            <span className="flex-shrink-0 p-0.5">
              <SquarePen
                size={12}
                className="text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              />
            </span>
          </div>
        )}
          </div>
        </div>
  );
};

const UserDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>(); 
  
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null); 
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [isLoading, setIsLoading] = useState(true); 

  const [editField, setEditField] = useState<keyof User | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'details' | 'related' | 'financials' | 'communications'
  >('details');


  useEffect(() => {
    if (!userId) {
      setError('User ID is missing from the URL.');
      setIsLoading(false);
      setTimeout(() => navigate('/setting/Users', { replace: true }), 1000);
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const latestUser = await userService.getById(userId); 

        const displaySchema = userSchema.omit({ password: true });
        const parsedResult = displaySchema.safeParse(latestUser);

        if (parsedResult.success) {
          setUser(parsedResult.data as User);
        } else {
          setError('Fetched user data is invalid. Redirecting...');
          setTimeout(() => navigate('/setting/Users', { replace: true }), 3000);
        }
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(`Failed to load user details: ${errorMessage}. Redirecting...`);
        setTimeout(() => navigate('/setting/Users', { replace: true }), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate]);

  const handleEdit = (field: keyof User) => {
    if (isSaving || isDeleting || !user) return; 
    setError(null); 

    setEditField(field);
    setTempValue(user[field]?.toString() || '');
  };

  const handleSave = async () => {
    if (!editField || !user) return;

    const fieldToUpdate = editField;
    const valueToSave =
        fieldToUpdate === 'middleName' || fieldToUpdate === 'phoneNo' || fieldToUpdate === 'password'
          ? tempValue === '' ? null : tempValue
          : tempValue;
    
    const updatedData: Partial<User> = {
        [fieldToUpdate]: valueToSave,
    };

    setError(null); 

    try {
        userUpdateSchema.parse(updatedData);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            setError('Validation error: ' + error.issues
                .map((e) => `${formatFieldName(e.path[0] as string)}: ${e.message}`)
                .join(', '));
        }
        return;
    }

    setIsSaving(true);
    
    const updatePromise = userService.update(user.id ?? '', updatedData)
        .then((res: any) => {
            if (res && (res.statusCode === 200 || res.statusCode === 204 || res.id)) {
                setUser((prev) => ({ 
                    ...prev!,
                    [fieldToUpdate]: valueToSave 
                }));
                setEditField(null);
                return { message: `${formatFieldName(fieldToUpdate)} updated successfully.` };
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
        loading: `Updating ${formatFieldName(fieldToUpdate)}...`,
        success: (data: { message: string }) => data.message,
        error: (err) => err.message,
    });
  };

  const handleCancel = () => {
    setEditField(null);
    setTempValue('');
    setError(null);
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);

    const deletePromise = userService.delete(user.id || '')
        .then(() => {
            setIsDeleteModalOpen(false); 
            navigate('/setting/Users'); 
            return { message: `${user.firstName} ${user.lastName} deleted successfully.` };
        })
        .catch((error: any) => {
            const errorMessage = extractErrorMessage(error);
            setError(errorMessage); 
            throw new Error(errorMessage);
        })
        .finally(() => {
            setIsDeleting(false);
        });

    toast.promise(deletePromise, {
        loading: `Deleting ${user.firstName} ${user.lastName}...`,
        success: (data: { message: string }) => data.message,
        error: (err) => err.message,
    });
  };

  const editableFields: (keyof User)[] = Object.keys(userSchema.shape)
    .filter((key) => key !== 'id' && key !== 'email' && key !== 'password') 
    .map((key) => key as keyof User);

  const accountFields = Object.keys(userSchema.shape)
    .filter((key) => key !== 'id' && key !== 'password')
    .map((key) => {
      const typedKey = key as keyof User;
      return {
        label: formatFieldName(typedKey),
        key: typedKey,
        isEditable: editableFields.includes(typedKey),
      };
    });

  const midIndex = Math.ceil(accountFields.length / 2);
  const leftColumnFields = accountFields.slice(0, midIndex);
  const rightColumnFields = accountFields.slice(midIndex);

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>{error}</p>
        <Button variant="outline" onClick={() => navigate('/setting/Users')} className="mt-4">
          Go Back to Users
        </Button>
      </div>
    );
  }
  if (!user) {
    return null; 
  }
  
  return (
    <div className="w-full h-full">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-4 sm:px-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-xs text-gray-500 flex items-center mb-1">
                <Building2 size={12} className="mr-1" />
                Account
              </div>
              <h1 className="text-2xl font-normal flex items-center">
                {user.firstName} {user.middleName || ''} {user.lastName} - Details
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                disabled={isDeleting || isSaving}
                className="text-sm border-red-500 text-red-500 hover:bg-red-50 cursor-pointer"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-7xl mx-auto p-4 sm:p-6 w-full bg-gray-100">
        <div className="min-h-[600px] flex flex-col w-full">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'details')}
            className="w-full"
          >
            <div className="bg-white rounded-md shadow-md mb-6 w-full">
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  <div className="space-y-2">
                    {leftColumnFields.map((item) =>
                      item.key === 'role' ? (
                        <RoleField
                          key={item.key}
                          label={item.label}
                          value={user[item.key]}
                          isEditing={editField === item.key}
                          tempValue={tempValue}
                          onEdit={() => handleEdit(item.key)}
                          onSave={handleSave}
                          onCancel={handleCancel}
                          onTempChange={setTempValue}
                        />
                      ) : (
                        <DetailField
                          key={item.key}
                          label={item.label}
                          value={user[item.key]}
                          fieldKey={item.key}
                          isEditable={editableFields.includes(item.key)}
                          isEditing={editField === item.key}
                          tempValue={tempValue}
                          onEdit={handleEdit}
                          onSave={handleSave}
                          onCancel={handleCancel}
                          onTempChange={setTempValue}
                        />
                      ),
                    )}
                  </div>
                  <div className="space-y-2">
                    {rightColumnFields.map((item) =>
                      item.key === 'role' ? (
                        <RoleField
                          key={item.key}
                          label={item.label}
                          value={user[item.key]}
                          isEditing={editField === item.key}
                          tempValue={tempValue}
                          onEdit={() => handleEdit(item.key)}
                          onSave={handleSave}
                          onCancel={handleCancel}
                          onTempChange={setTempValue}
                        />
                      ) : (
                        <DetailField
                          key={item.key}
                          label={item.label}
                          value={user[item.key]}
                          fieldKey={item.key}
                          isEditable={editableFields.includes(item.key)}
                          isEditing={editField === item.key}
                          tempValue={tempValue}
                          onEdit={handleEdit}
                          onSave={handleSave}
                          onCancel={handleCancel}
                          onTempChange={setTempValue}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
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
            <AlertDialogCancel 
                className="cursor-pointer"
                disabled={isDeleting}
            >
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