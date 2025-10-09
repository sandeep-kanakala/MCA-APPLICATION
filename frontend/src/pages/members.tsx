import { useState } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Member } from '@/types/members'; 

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Shubham Vyas',
    email: 'svyas@linkfields.com',
    isSuperUser: true,
    isAdmin: true,
    isBillingAdmin: true,
    status: 'active',
  },
  {
    id: '2',
    name: 'Shubham Vyas',
    email: 'svyas@linkfields.com',
    isSuperUser: true,
    isAdmin: true,
    isBillingAdmin: true,
    status: 'active',
  },
  {
    id: '3',
    name: 'Shubham Vyas',
    email: 'svyas@linkfields.com',
    isSuperUser: true,
    isAdmin: true,
    isBillingAdmin: true,
    status: 'active',
  },
  {
    id: '4',
    name: 'Shubham Vyas',
    email: 'svyas@linkfields.com',
    isSuperUser: true,
    isAdmin: true,
    isBillingAdmin: true,
    status: 'active',
  },
  {
    id: '5',
    name: 'Michael Chen',
    email: 'mchen@linkfields.com',
    isSuperUser: false,
    isAdmin: false,
    isBillingAdmin: false,
    status: 'active',
  },
  {
    id: '6',
    name: 'Shubham Vyas',
    email: 'svyas@linkfields.com',
    isSuperUser: false,
    isAdmin: true,
    isBillingAdmin: false, 
    status: 'active',
  },
];

const getStatusBadge = (
  isRole: boolean,
  memberId: string
) => {
    if (memberId === '6' && !isRole) {
        return (
            <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none px-3 font-semibold text-xs py-0.5 rounded-full"
            >
                Active
            </Badge>
        );
    }

    if (isRole) {
        return (
            <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 font-semibold text-xs py-0.5 rounded-full"
            >
                Yes
            </Badge>
        );
    }

    return (
        <Badge
            variant="secondary"
            className="bg-red-50 text-red-700 hover:bg-red-50 border-none px-3 font-semibold text-xs py-0.5 rounded-full" 
        >
            No
        </Badge>
    );
};


export function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [perPage, setPerPage] = useState('10');
  const totalResults = 10;
  const currentPageCount = mockMembers.length;

  const filteredMembers = mockMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-8">
            {/* Main two-column layout wrapper */}
            <div className="flex">
              
              {/* LEFT COLUMN: Sidebar-like Navigation/Header (fixed width) */}
              <div className="w-[200px] flex-shrink-0 pr-8"> 
                <div className="border-l-4 border-blue-600 pl-4 py-1">
                  <h1 className="text-lg font-semibold text-gray-900 mb-1">Members</h1>
                  <p className="text-sm text-gray-500">Manage team members.</p>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-block mt-3 pl-4">
                  View all roles and permissions
                </a>
              </div>

              {/* RIGHT COLUMN: Search, Tabs, and Table (grows to fill space) */}
              <div className="flex-grow">
                
                {/* Search and Add Button Row */}
                <div className="flex items-center justify-between mb-6"> {/* Adjusted margin-bottom */}
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search account"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-4 rounded-lg text-sm font-semibold shadow-md whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Member
                  </Button>
                </div>
                
                {/* Tabs Area and Content */}
                <Tabs defaultValue="users" className="w-full">
                  {/* TabsList wrapped in its own container to replicate the look in the image */}
                  <div className="bg-white border border-gray-200 rounded-sm mb-6 shadow-sm overflow-hidden">
                    <TabsList className="w-full h-auto p-2 bg-transparent border-b border-gray-200"> {/* Added p-4 padding here */}
                      <TabsTrigger
                        value="users"
                        // Tab style with bottom border/line
                        className="border-b-2 border-blue-600 font-semibold text-gray-700 text-base justify-start pb-3"
                      >
                        Users
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className=" border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-gray-700 data-[state=active]:text-blue-600 text-base justify-start mr-170 pb-3"
                      >
                        Pending Invitations
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Users Table Content - Now in its own card structure with the table header at the top */}
                  <TabsContent value="users" className="mt-0"> 
                    <div className="border border-gray-200 rounded-lg overflow-hidden"> {/* New card for the table */}
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-white border-b border-gray-300 "> {/* Changed to bg-white to match the image */}
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wider h-15">Account Name</TableHead>
                            <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wider">Super User</TableHead>
                            <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wider">Admin</TableHead>
                            <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wider">Billing Admin</TableHead>
                            <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wider">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMembers.map((member) => (
                            <TableRow key={member.id} className="hover:bg-gray-50 border-b border-gray-300 last:border-b-0">
                              <TableCell className="py-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-gray-200 text-gray-600 text-xs font-semibold">
                                    {getInitials(member.name)}
                                  </AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 text-sm">{member.name}</span>
                                    <a href="#" className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                                      (Admin access)
                                    </a>
                                  </div>
                                  <span className="text-xs text-gray-500">{member.email}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">{getStatusBadge(member.isSuperUser, member.id)}</TableCell>
                              <TableCell className="py-3">{getStatusBadge(member.isAdmin, member.id)}</TableCell>
                              <TableCell className="py-3">{getStatusBadge(member.isBillingAdmin, member.id)}</TableCell>
                              <TableCell className="py-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-4 text-gray-700 hover:bg-gray-100 border-gray-300 rounded-lg text-sm font-medium"
                                >
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white">
                        <div className="text-sm text-gray-600">
                          Showing **1 to {currentPageCount}** of **{totalResults}** results
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Select value={perPage} onValueChange={setPerPage}>
                              <SelectTrigger className="w-[120px] h-9 text-sm rounded-lg border-gray-300">
                                <SelectValue placeholder="10 Per page" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 Per page</SelectItem>
                                <SelectItem value="25">25 Per page</SelectItem>
                                <SelectItem value="50">50 Per page</SelectItem>
                                <SelectItem value="100">100 Per page</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 p-0 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                              disabled
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="text-sm text-gray-600 font-medium px-2">1/1</div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 p-0 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                              disabled
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Pending Invitations Content */}
                  <TabsContent value="pending" className="mt-6">
                    <div className="text-center py-12 text-gray-500 border border-gray-200 rounded-lg">
                      No pending invitations
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}