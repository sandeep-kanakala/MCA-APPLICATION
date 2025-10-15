import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import UploadFile from '@/features/components/uploadFile';
import '@/index.css';

export default function ProfilePage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 p-2 flex items-start">
          <div className="w-0.5 h-10 bg-primary  mr-2 rounded"></div>
          <div>
            <div className="font-medium text-black">Profile</div>
            <div className="text-xs text-black">Change your user profile</div>
          </div>
        </div>
        <div className="w-full md:w-3/4">
          <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm  p-2 pt-6">
            <CardContent className="px-2 py-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input id="lastName" placeholder="Ex : Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative ">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 ">@</span>
                  <Input id="email" className="pl-8 " placeholder="example@xyz.com" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Label className="text-sm font-medium ">Avatar</Label>
                  <p className="text-sm  italic ">
                    Supported files: .png, .jpg, .jpeg{' '}
                    <span className="text-primary">(Max file size: 10mb)</span>
                  </p>
                </div>
                <UploadFile />
              </div>

              <div className="border-t border-gray-300 -mx-4 pt-2">
                <div className="flex justify-end gap-3 px-4 py-2">
                  <Button variant="outline" className="px-6">
                    Cancel
                  </Button>
                  <Button className="bg-primary">Save Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
              className="text-xs font-bold  underline text-primary text-primary transition-opacity duration-200 mt-1"
            >
              Reset password
            </a>
          </div>
        </div>
        <div className="w-full md:w-3/4">
          <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm  p-2 pt-6">
            <CardContent className="px-2 py-0 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <span
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2  hover:text-[rgba(39,74,255,0.9)] transition-opacity duration-200 cursor-pointer"
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
                      placeholder="Enter password"
                      className="pr-10"
                    />
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2  hover:text-[rgba(39,74,255,0.9)] transition-opacity duration-200 cursor-pointer"
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
                      placeholder="Enter password"
                      className="pr-10"
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2  hover:text-[rgba(39,74,255,0.9)] transition-opacity duration-200 cursor-pointer"
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
                <div className="flex justify-end gap-3 px-4 py-2">
                  <Button variant="outline" className="px-6">
                    Cancel
                  </Button>
                  <Button className="bg-primary">Save Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 p-2 flex items-start">
          <div className="w-0.5 h-10 bg-primary mr-2 rounded"></div>
          <div>
            <div className="font-medium text-black">Danger Zone</div>
            <div className="text-xs text-black">Be careful</div>
          </div>
        </div>
        <div className="w-full md:w-3/4">
          <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm p-2 ">
            <CardContent className="px-2 py-0 space-y-6">
              <div>
                <Button className="bg-primary">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
