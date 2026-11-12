import React from 'react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  ariaSort?: 'none' | 'ascending' | 'descending';
  onSort?: () => void;
  className?: string;
}

export interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  caption,
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
  className = ''
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto border border-[#C5CCD6] rounded ${className}`}>
      <table className="w-full text-left text-sm border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-[#0B2A5B] text-white">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                aria-sort={col.ariaSort}
                className={`py-3 px-4 font-semibold text-xs tracking-wider uppercase border-b border-[#0B2A5B] ${
                  col.sortable ? 'cursor-pointer hover:bg-[#071C3F] select-none' : ''
                } ${col.className || ''}`}
                onClick={col.onSort}
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.header}</span>
                  {col.sortable && (
                    <span className="text-[10px] opacity-80" aria-hidden="true">
                      {col.ariaSort === 'ascending' ? '▲' : col.ariaSort === 'descending' ? '▼' : '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#C5CCD6]">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-[#4A4F57] bg-white font-medium"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                className={`transition-colors hover:bg-[#EBF1F8] ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#F4F6FA]'
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 px-4 text-[#1A1A1A] ${col.className || ''}`}>
                    {col.render ? col.render(row, index) : (row as any)[col.key]}
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
