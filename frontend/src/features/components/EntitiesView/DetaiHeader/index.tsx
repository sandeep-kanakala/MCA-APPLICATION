'use client';
interface EntityHeaderProps<T extends Record<string, any>> {
  entityType: string;
  entityData: any;
  topFields?: (keyof T)[];
  labelField?: string;
  hideName?: boolean;
}

const EntityHeader = <T extends Record<string, any>>({
  entityType,
  entityData,
  topFields = [],
  labelField,
  hideName = false,
}: EntityHeaderProps<T>) => {
  const fieldsToShow =
    topFields.length > 0 ? topFields : (Object.keys(entityData).slice(0, 3) as (keyof T)[]);
  const name = (() => {
    if (labelField === 'productId' && entityData?.product?.name) return entityData.product.name;
    if (labelField && entityData?.[labelField]) return entityData[labelField];
    if (entityType === 'pricebookentry') return 'Price Book Entry';
    if (entityData?.name) return entityData.name;
    if (entityData?.firstName) return `${entityData.firstName} ${entityData.lastName || ''}`.trim();
    return 'Unnamed';
  })();

  return (
    <div className="bg-white w-full p-2">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 capitalize">
        {entityType}
      </div>
      {!hideName && (
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">{name}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
        {fieldsToShow.map((key) => {
          const value = entityData[key];
          let label = String(key)
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (s) => s.toUpperCase());
          if (String(key) === 'sku') label = 'Product Code';

          const isStatus =
            typeof value === 'string' &&
            ['active', 'inactive', 'pending'].includes(value.toLowerCase());

          return (
            <div key={String(key)}>
              <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
              {isStatus ? (
                <div className="flex items-center mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      value.toLowerCase() === 'active'
                        ? 'bg-green-500'
                        : value.toLowerCase() === 'inactive'
                          ? 'bg-gray-400'
                          : 'bg-yellow-400'
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {value}
                  </span>
                </div>
              ) : (
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {value ? String(value) : '—'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EntityHeader;
