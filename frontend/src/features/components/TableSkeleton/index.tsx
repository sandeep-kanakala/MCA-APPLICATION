const TableSkeleton = ({ columns }: any) => {
  return (
    <div className="overflow-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col: any) => (
              <th key={col.id} className="border-b border-gray-300 px-4 py-2 text-left">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              {columns.map((col: any, cIdx: string) => (
                <td key={col.id ?? cIdx} className="px-4 py-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default TableSkeleton;
