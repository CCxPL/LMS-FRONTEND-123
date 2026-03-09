import React from 'react';

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

function Table<T>({ 
  columns, 
  data, 
  keyExtractor, 
  onRowClick, 
  emptyMessage = 'No data found',
  loading = false
}: TableProps<T>) {
  const getCellValue = (row: T, accessor: TableColumn<T>['accessor']) => {
    if (typeof accessor === 'function') {
      return accessor(row);
    }
    return row[accessor] as React.ReactNode;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-100 rounded mb-2" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-50 rounded mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i} 
                className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr 
                key={keyExtractor(row)} 
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, i) => (
                  <td key={i} className={`px-6 py-4 text-sm text-gray-900 ${col.className || ''}`}>
                    {getCellValue(row, col.accessor)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;