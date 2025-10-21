import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  SquarePen,
  Check,
  X,
  Building2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { accountSchema } from '../utils';
import accountService from '@/utils/services/accounts';

type Account = z.infer<typeof accountSchema>;

const formatFieldName = (field: string): string => {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};
interface DetailFieldProps {
  label: string;
  value: string | null | undefined;
  fieldKey: keyof Account | string;
  isEditable: boolean;
  isEditing: boolean;
  tempValue: string;
  onEdit: (field: keyof Account) => void;
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
  const accountFieldKey = fieldKey as keyof Account;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-0 px-0 sm:px-0 border-b border-gray-400 last:border-b-0">
      <span className="text-gray-500 text-sm sm:text-xs w-full sm:w-[130px] font-medium pr-4 mb-1 sm:mb-0">
        {label}
      </span>
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-0.5 w-full">
            <input
              className="border border-blue-300 bg-white rounded-sm px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 flex-grow min-w-0 h-6"
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
            className={`flex items-center justify-between gap-1 group relative w-full ${isEditable ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={() => isEditable && onEdit(accountFieldKey)}
          >
            <span
              className={`text-gray-800 text-sm break-words py-0.5 pr-2 truncate ${isEditable ? 'group-hover:text-blue-600' : ''}`}
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
                    onEdit(accountFieldKey);
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

const AccountDetailView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { accountId } = useParams<{ accountId: string }>();
  const [account, setAccounts] = useState<Account | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await accountService.getById(`${accountId}`);
        const apiAccount = response;
        const parsedAccount = accountSchema.parse(apiAccount);
        setAccounts(parsedAccount);
      } catch (err: any) {
        setError('Failed to load account data');
        navigate('/apps/sales/accounts', { replace: true });
      }
    };

    fetchAccount();
  }, [location.state, accountId, navigate]);

  const [editField, setEditField] = useState<keyof Account | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'related'>('details');
  const [isAccountInfoOpen, setIsAccountInfoOpen] = useState(true);

  const handleEdit = (field: keyof Account) => {
    setEditField(field);
    setTempValue(account?.[field]?.toString() || '');
  };

  const handleSave = async () => {
    if (!editField) return;

    const updatedData: Partial<Account> = {
      [editField]:
        editField === 'name' || editField === 'phone'
          ? tempValue === ''
            ? null
            : tempValue
          : tempValue,
    };

    try {
      const mergedData = { ...account, ...updatedData };
      const parsedAccount = accountSchema.parse(mergedData);
      const normalizedAccount = Object.fromEntries(
  Object.entries(parsedAccount).map(([k, v]) => [k, v === null ? undefined : v])
);

await accountService.update('' + accountId, normalizedAccount);

      setAccounts(parsedAccount);
      setEditField(null);
      setError(null);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setError(
          'Validation error: ' +
            error.issues
              .map((e) => `${formatFieldName(e.path[0] as string)}: ${e.message}`)
              .join(', '),
        );
      } else {
        setError(error.message || 'Failed to update Account');
      }
    }
  };

  const handleCancel = () => {
    setEditField(null);
    setTempValue('');
    setError(null);
  };

  const handleDelete = async () => {
    try {
      await accountService.delete('' + accountId);
      setIsDeleteModalOpen(false);
      navigate('/apps/sales/accounts');
    } catch (error: any) {
      setError(error.message || 'Failed to delete account');
    }
  };

  const editableFields: (keyof Account)[] = Object.keys(accountSchema.shape)
    .filter((key) => key !== 'name') 
    .map((key) => key as keyof Account);

  const accountFields = Object.keys(accountSchema.shape).map((key) => {
    const typedKey = key as keyof Account;
    return {
      label: typedKey
        .replace(/([A-Z])/g, ' $1') 
        .replace(/^./, (str) => str.toUpperCase()),
      key: typedKey,
      isEditable: editableFields.includes(typedKey),
    };
  });

  
  const midIndex = Math.ceil(accountFields.length / 2);
  const leftColumnFields = accountFields.slice(0, midIndex);
  const rightColumnFields = accountFields.slice(midIndex);

  if (error && error.includes('Invalid account data')) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
        <Button variant="outline" onClick={() => navigate('/apps/sales/accounts')} className="mt-4">
          Back to Accounts
        </Button>
      </div>
    );
  }
  if (!account) {
    return <div>Loading...</div>;
  }
  return (
    <div className="bg-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-4 sm:px-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-xs text-gray-500 flex items-center mb-1">
                <Building2 size={12} className="mr-1" />
                Account
              </div>
              <h1 className="text-2xl font-normal flex items-center">
                {account?.name} - Service Account
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="text-sm border-red-500 cursor-pointer hover:text-red-300 text-red-500 hover:bg-red-50"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[600px] flex flex-col">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
            className="w-full"
          >
            <div className="bg-white rounded-md shadow-md mb-6">
              <TabsList className="bg-white border-b border-gray-200 h-10 w-full justify-start px-4 p-0 rounded-none inline-flex items-center">
                <TabsTrigger
                  value="details"
                  className="h-full border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 rounded-none px-4 py-0 bg-transparent text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="related"
                  className="h-full border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 rounded-none px-4 py-0 bg-transparent text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Related
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="p-4 sm:p-6 mt-0">
                <div className="mb-8 border border-gray-200 rounded-md">
                  <div
                    className="p-4 bg-gray-50/50 cursor-pointer transition-colors hover:bg-gray-100"
                    onClick={() => setIsAccountInfoOpen(!isAccountInfoOpen)}
                  >
                    <h3 className="text-base font-semibold text-gray-800 flex items-center">
                      {isAccountInfoOpen ? (
                        <ChevronDown size={16} className="mr-2" />
                      ) : (
                        <ChevronRight size={16} className="mr-2" />
                      )}
                      Account Information
                    </h3>
                  </div>

                  {isAccountInfoOpen && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                        <div className="space-y-2">
                          {leftColumnFields.map((item) => (
                            <DetailField
                              key={item.key}
                              label={item.label}
                              value={account[item.key as keyof Account]}
                              fieldKey={item.key}
                              isEditable={
                                item.isEditable &&
                                editableFields.includes(item.key as keyof Account)
                              }
                              isEditing={editField === item.key}
                              tempValue={tempValue}
                              onEdit={handleEdit}
                              onSave={handleSave}
                              onCancel={handleCancel}
                              onTempChange={setTempValue}
                            />
                          ))}
                        </div>
                        <div className="space-y-2">
                          {rightColumnFields.map((item) => (
                            <DetailField
                              key={item.key}
                              label={item.label}
                              value={account[item.key as keyof Account]}
                              fieldKey={item.key}
                              isEditable={
                                item.isEditable &&
                                editableFields.includes(item.key as keyof Account)
                              }
                              isEditing={editField === item.key}
                              tempValue={tempValue}
                              onEdit={handleEdit}
                              onSave={handleSave}
                              onCancel={handleCancel}
                              onTempChange={setTempValue}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="related" className="p-4 sm:p-6 mt-0">
                Related Content...
              </TabsContent>
              <TabsContent value="financials" className="p-4 sm:p-6 mt-0">
                Financials Content...
              </TabsContent>
              <TabsContent value="communications" className="p-4 sm:p-6 mt-0">
                Communications Content...
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="lg:col-span-1 bg-white rounded-md shadow-md h-full sticky top-[138px] max-h-[80vh] overflow-y-auto">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="bg-gray-100 border-b border-gray-200 h-10 rounded-none w-full justify-start sticky top-0 z-5 p-0">
              <TabsTrigger
                value="activity"
                className="h-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-r data-[state=active]:border-l rounded-none px-6 py-0 bg-transparent text-gray-700"
              >
                Activity
              </TabsTrigger>
            </TabsList>
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
    </div>
  );
};

export default AccountDetailView;
