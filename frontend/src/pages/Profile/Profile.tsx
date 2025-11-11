import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import UploadFile from '@/features/components/uploadFile';
import userService from '@/utils/services/user';
import type { User } from '@/types';
import { toast } from '@/components/ui/sonner';
import { extractErrorMessage } from '@/utils';
import { useAppSelector } from '@/app/hooks';
import type { AppState } from '@/app/store';

import { changeAuthenticatedPassword } from '@/utils/services/login';
type ProfileUser = Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;

export default function ProfilePage() {
  const { data: userData, loading }: any = useAppSelector((state: AppState) => state.userRole);

  const initialUserState: ProfileUser = {
    id: userData?.id || '',
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || '',
  };

  const [profileForm, setProfileForm] = useState<ProfileUser>(initialUserState);
  const [isSaving, setIsSaving] = useState(false);

  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'success' | 'error' | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!loading && userData && userData.id) {
      setProfileForm({
        id: userData.id || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
      });
    }
  }, [loading, userData]);

  const handleInputChange = (e: any) => {
    const { id, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveDetails = async (e: any) => {
    e.preventDefault();
    setIsSaving(true);

    const updatePayload = {
      firstName: profileForm.firstName || undefined,
      lastName: profileForm.lastName || undefined,
    };

    if (!profileForm.id) {
      toast.error('User ID is missing. Cannot save profile.');
      setIsSaving(false);
      return;
    }

    try {
      const response = await userService.update(profileForm.id, updatePayload);
      const message = response?.message || 'Profile updated successfully!';
      toast.success(message);
    } catch (error: any) {
      console.error('Profile update failed:', error);
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordInputChange = (e: any) => {
    const { id, value } = e.target;
    setPasswordFields((prev) => ({ ...prev, [id]: value }));
    setPasswordStatus(null);
  };

  const handleChangePassword = async (e: any) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordStatus(null);

    const { currentPassword, newPassword, confirmPassword } = passwordFields;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus('error');
      toast.error('All password fields are required.');
      setIsChangingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      toast.error('New Password and Confirm Password do not match.');
      setIsChangingPassword(false);
      return;
    }

    try {
      await changeAuthenticatedPassword(profileForm.email, newPassword);
      setPasswordStatus('success');
      toast.success('Password changed successfully!');

      setPasswordFields({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Password change failed:', error);
      setPasswordStatus('error');
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading profile details...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 p-2 flex items-start">
          <div className="w-0.5 h-10 bg-primary mr-2 rounded"></div>
          <div>
            <div className="font-medium text-black">Profile</div>
            <div className="text-xs text-black">Change your user profile</div>
          </div>
        </div>
        <div className="w-full md:w-3/4">
          <form onSubmit={handleSaveDetails}>
            <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm p-2 pt-6">
              <CardContent className="px-2 py-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={profileForm.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Ex : Doe"
                      value={profileForm.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">@</span>
                    <Input
                      id="email"
                      className="pl-8 bg-gray-100 cursor-not-allowed"
                      placeholder="example@xyz.com"
                      value={profileForm.email}
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Label className="text-sm font-medium">Avatar</Label>
                    <p className="text-sm italic">
                      Supported files: .png, .jpg, .jpeg{' '}
                      <span className="text-primary">(Max file size: 10mb)</span>
                    </p>
                  </div>
                  <UploadFile />
                </div>

                <div className="border-t border-gray-300 -mx-4 pt-2">
                  <div className="flex justify-end gap-3 px-4 py-2 items-center">
                    <Button variant="outline" className="px-6 cursor-pointer" type="button">
                      Cancel
                    </Button>
                    <Button className="bg-primary cursor-pointer" type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Details'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 p-2 flex items-start">
          <div className="w-0.5 h-10 bg-primary mr-2 rounded"></div>
          <div>
            <div className="font-medium text-black">Security</div>
            <div className="text-xs text-black">Forgot your password?</div>
            <a
              href="#"
              className="text-xs font-bold underline text-primary transition-opacity duration-200 mt-1"
            >
              Reset password
            </a>
          </div>
        </div>
        <div className="w-full md:w-3/4">
          <form onSubmit={handleChangePassword}>
            <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm p-2 pt-6">
              <CardContent className="px-2 py-0 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      className="pr-10"
                      value={passwordFields.currentPassword}
                      onChange={handlePasswordInputChange}
                    />
                    <span
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary transition-opacity duration-200 cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="pr-10"
                        value={passwordFields.newPassword}
                        onChange={handlePasswordInputChange}
                      />
                      <span
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary transition-opacity duration-200 cursor-pointer"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        className="pr-10"
                        value={passwordFields.confirmPassword}
                        onChange={handlePasswordInputChange}
                      />
                      <span
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary transition-opacity duration-200 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-300 -mx-4 pt-2">
                  <div className="flex justify-end gap-3 px-4 py-2 items-center">
                    {passwordStatus === 'success' && (
                      <span className="text-sm text-green-600">Password changed!</span>
                    )}
                    {passwordStatus === 'error' && (
                      <span className="text-sm text-red-600">Change failed.</span>
                    )}
                    <Button variant="outline" className="px-6 cursor-pointer" type="button">
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary cursor-pointer"
                      type="submit"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
