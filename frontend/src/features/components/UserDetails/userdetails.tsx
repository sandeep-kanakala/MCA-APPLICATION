import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SquarePen, Check, X, MoreVertical } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import userData from '@/features/components/Users/utils/user.json';

const schema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string(),
  email: z.string(),
  phoneNo: z.string(),
});

type User = z.infer<typeof schema>;

const fallbackUser: User = {
  id: '',
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phoneNo: '',
};

const defaultUser: User = userData.length > 0 ? schema.parse(userData[2]) : fallbackUser;

const LOCAL_STORAGE_KEY = 'userDetails';

const formatFieldName = (field: string): string => {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

const UserForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(() => {
    const stateUser = location.state?.user;
    if (stateUser) {
      try {
        return schema.parse(stateUser);
      } catch (error) {
        console.error('Invalid user data from route state:', error);
      }
    }
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedUser) {
      try {
        return schema.parse(JSON.parse(storedUser));
      } catch (error) {
        console.error('Invalid user data in localStorage:', error);
      }
    }
    return defaultUser;
  });
  const [editField, setEditField] = useState<keyof User | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const saveToLocalStorage = (updatedUser: User) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
  };
  useEffect(() => {
    saveToLocalStorage(user);
  }, [user]);

  const handleEdit = (field: keyof User) => {
    setEditField(field);
    setTempValue(user[field]?.toString() || '');
  };

  const handleSave = () => {
    if (editField) {
      const updatedUser = {
        ...user,
        [editField]: editField === 'middleName' && tempValue === '' ? null : tempValue,
      };
      try {
        schema.parse(updatedUser);
        setUser(updatedUser);
        setEditField(null);
      } catch (error) {
        console.error('Validation error:', error);
        alert('Invalid input. Please check the data.');
      }
    }
  };

  const handleCancel = () => {
    setEditField(null);
    setTempValue('');
  };

  const handleDelete = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    alert('User deleted successfully.');
    setIsDeleteModalOpen(false);
    navigate('/table');
  };

  const editableFields: (keyof User)[] = ['firstName', 'middleName', 'lastName', 'phoneNo'];

  return (
    <div className="max-w-5xl sm:max-w-5xl min-h-[150px] mx-auto mt-6 bg-white rounded-md p-4 sm:p-6 relative">
      <div className="absolute top-2 right-9">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More options">
              <MoreVertical size={20} className="text-gray-800" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-gray-300">
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-red-600 cursor-pointer"
                >
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[425px] bg-gray-100 border-gray-300">
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this user? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-blue-500 pb-2">User Information</h2>
        <div className="border-b border-gray-300 -mx-4 sm:-mx-6"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {Object.entries(user).map(([key, value]) => {
          if (key === 'id') return null;
          const field = key as keyof User;
          const isEditing = editField === field;
          const isEditable = editableFields.includes(field);

          return (
            <div
              key={key}
              className="flex flex-col sm:flex-row items-start sm:items-center py-2 px-2 sm:px-4"
            >
              <span className="text-gray-700 dark:text-gray-300 sm:text-right w-full sm:w-[130px] font-medium pr-4 mb-1 sm:mb-0">
                {formatFieldName(field)}
              </span>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <input
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 flex-grow min-w-[150px] sm:min-w-[200px]"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded p-1 transition"
                        aria-label={`Save ${formatFieldName(field)}`}
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded p-1 transition"
                        aria-label={`Cancel ${formatFieldName(field)}`}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-2 group relative ${
                      isEditable ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => isEditable && handleEdit(field)}
                  >
                    <span
                      className={`text-gray-800 dark:text-gray-200 break-words min-w-[150px] sm:min-w-[200px] transition-all duration-150 ease-in-out ${
                        isEditable
                          ? 'border border-transparent border-b-gray-200 dark:border-b-gray-600 pb-1 px-2 group-hover:border-gray-300 dark:group-hover:border-gray-500 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 group-hover:rounded'
                          : 'border-b border-gray-200 dark:border-b-gray-600 pb-1 px-2 cursor-not-allowed'
                      }`}
                    >
                      {value === null ? 'N/A' : value || 'N/A'}
                    </span>
                    {isEditable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(field);
                        }}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer"
                        aria-label={`Edit ${formatFieldName(field)}`}
                      >
                        <SquarePen size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserForm;
