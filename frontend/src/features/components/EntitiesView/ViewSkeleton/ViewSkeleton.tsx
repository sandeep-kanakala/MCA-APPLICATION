export const ViewSkeleton = ({ midIndex }: any) => (
  <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-pulse space-y-6">
    <div className="flex justify-between items-center mb-4">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
        <div className="h-6 w-48 bg-gray-300 rounded"></div>
      </div>
      <div className="h-8 w-20 bg-gray-300 rounded"></div>
    </div>
    <div className="bg-white rounded-md shadow-md p-4 space-y-4">
      <div className="h-10 w-full bg-gray-200 rounded mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          {Array.from({ length: midIndex }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="h-4 w-32 bg-gray-300 rounded"></div>
              <div className="h-4 flex-1 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: midIndex }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="h-4 w-32 bg-gray-300 rounded"></div>
              <div className="h-4 flex-1 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="bg-white rounded-md shadow-md p-4 h-64"></div>
  </div>
);
