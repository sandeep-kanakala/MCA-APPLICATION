export default function NoDataFound({ message, onAddClick }: any) {
  return (
    <div className="flex items-center justify-center h-[70vh] bg-gradient-to-b from-gray-50 to-white">
      <div className="border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-white p-10 text-center max-w-md">
        <div className="flex justify-center mb-4">
          {onAddClick && (
            <div
              className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 border border-blue-100 cursor-pointer"
              onClick={() => onAddClick()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{message || 'No Data Found'}</h2>
        <p className="mt-2 text-gray-500">
          There’s nothing to display right now. Add or update data to see results here.
        </p>
      </div>
    </div>
  );
}
