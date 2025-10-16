import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Account {
  id: string;
  name: string;
  path: string;
  logo: string;
}

export default function Tenantspage() {
  const accounts: Account[] = [
    { id: '1', name: 'Multichoice', path: '/apps/sales/dashboard', logo: 'W' },
    // { id: '2', name: 'LFI India', path: '/app/indiadinai/dashboard', logo: 'W' },
    // { id: '3', name: 'Linkworks Accounts', path: '/admin', logo: 'W' },
  ];

  const [activeButton, setActiveButton] = useState<string>('multichoice');
  const navButtons = [
    { id: 'multichoice', label: 'Multichoice' },
    { id: 'create', label: 'Create New Account' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl">
        <Card className="overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-2/5 bg-white border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 bg-blue-600">
                    <AvatarFallback className="bg-blue-600 text-white font-medium">
                      JY
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">John Doe</div>
                    <div className="text-sm text-gray-500">John@gmail.com</div>
                  </div>
                </div>
                <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  Logout
                </Button>
              </div>

              <nav className="p-4 space-y-2">
                {navButtons.map((btn) => (
                  <Button
                    key={btn.id}
                    variant="ghost"
                    className={`w-full justify-start font-medium ${
                      activeButton === btn.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                    }`}
                    onClick={() => setActiveButton(btn.id)}
                  >
                    {btn.label}
                  </Button>
                ))}
              </nav>
            </div>
            <div className="w-full lg:w-3/5">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Multichoice</h1>
              </div>

              <div className="p-3 md:p-6">
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <Link to={account?.path}>
                      <button
                        key={account.id}
                        className="w-full flex items-center gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors group rounded-lg md:rounded-none"
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-600">
                          <span className="text-white font-bold text-xl">{account.logo}</span>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900">{account.name}</div>
                          <div className="text-sm text-gray-500">{account.path}</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-800 group-hover:text-gray-600" />
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
