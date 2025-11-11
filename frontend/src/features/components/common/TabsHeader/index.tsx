import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabsHeaderProps {
  tabs: { value: string; label: string }[];
}

export default function TabsHeader({ tabs }: TabsHeaderProps) {
  return (
    <div className={`relative w-full border-b border-gray-200`}>
      <TabsList className="bg-white border-b border-gray-200 h-10 justify-start px-4 p-0 rounded-none inline-flex items-center">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="h-full cursor-pointer border-b-2 border-x-0 border-t-0 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 rounded-none px-4 py-0 bg-transparent text-gray-700 hover:text-blue-600 transition-colors"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
