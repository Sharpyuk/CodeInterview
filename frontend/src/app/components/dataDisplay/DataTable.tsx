import React, { useEffect, useRef } from 'react';

type DataTableProps = {
  data?: any[];
  loadMoreData: () => void;
};

export function DataTable({ data = [], loadMoreData }: DataTableProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (data?.length === 0) return;
    const handleScroll = () => {
      if (gridRef.current) {
        const { scrollTop, clientHeight, scrollHeight } = gridRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 200) {
          // Load more data if we're within 200px of the bottom
          loadMoreData();
        }
      }
    };

    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (gridElement) {
        gridElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [loadMoreData]);

  if ((data || []).length === 0) {
    return <p className="text-center text-gray-500">No results found.</p>;
  }

  const sortedArray = data.sort((a, b) => a.Host.localeCompare(b.Host));

  return (
    <div
      ref={gridRef}
      className="w-full max-w-5xl mx-auto mt-8 overflow-y-auto pl-4 pr-4"
      style={{ maxHeight: 'calc(100vh - 150px)' }}
    >
    <div className="grid grid-cols-12 gap-0 bg-gray-200 p-4 font-semibold text-gray-700 sticky top-0 z-10">
      <div className="col-span-3">Host</div>
      <div className="col-span-1">ID</div>
      <div className="col-span-3">Comment</div>
      <div className="col-span-2">Owner</div>
      <div className="col-span-2">IPs</div>
      <div className="col-span-1">Ports</div>
    </div>

    {(sortedArray || []).map((item, index) => (
      <div
        key={index}
        className="grid grid-cols-12 gap-0 p-4 border-b hover:bg-blue-50 text-gray-800 transition-all duration-200"
      >
        <div className="col-span-3">{item.Host}</div>
        <div className="col-span-1">{item.ID}</div>
        <div className="col-span-3">{item.Comment}</div>
        <div className="col-span-2">{item.Owner}</div>
        <div className="col-span-2">
          {(item.IPs || []).map((ip: any, i: any) => (
            <div key={i}>{ip?.Address}</div>
          ))}
        </div>
        <div className="col-span-1">
          {(item.Ports || []).map((port: any, i: any) => (
            <div key={i}>{port?.Port}</div>
          ))}
        </div>
      </div>
    ))}
    </div>
  );
}
