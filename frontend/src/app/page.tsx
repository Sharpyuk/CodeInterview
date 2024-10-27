'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

import Header from '@/app/components/Header';

const pageSize = 10; // Number of items to fetch per request

export default function HomePage() {
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [isGridView, setIsGridView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [inputPage, setInputPage] = useState(1); // State for page input field
  const [totalPages, setTotalPages] = useState(0);
  const searchParams = useSearchParams();

  const fetchData = async (filterParam: string, page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/assets?filter=${filterParam}&maxAssets=${pageSize}&assetOffset=${(page - 1) * pageSize}`
      );
      const result = await response.json();
      if (result && result.assets) {
        setData((prevData) => (isGridView ? [...prevData, ...result.assets] : result.assets));
        setTotalPages(result.total_pages || 1);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync inputPage whenever pageNumber changes
  useEffect(() => {
    setInputPage(pageNumber);
  }, [pageNumber]);

  const validatePageNumber = () => {
    const newPageNumber = inputPage < 1 ? 1 : Math.min(inputPage, totalPages);
    setPageNumber(newPageNumber);
  };

  const loadMoreData = useCallback(() => {
    if (!isLoading) {
      setPageNumber((prevPage) => prevPage + 1);
    }
  }, [isLoading]);

  useEffect(() => {
    const currentFilter = searchParams.get('filter') || '';
    setFilter(currentFilter);
    setData([]); // Reset data when filter or view changes
    setPageNumber(1); // Reset page to 1
    fetchData(currentFilter, 1);
  }, [searchParams, isGridView]);

  useEffect(() => {
    if (isGridView && pageNumber > 1) {
      fetchData(filter, pageNumber); // Fetch more data for infinite scroll in grid mode
    } else if (!isGridView) {
      fetchData(filter, pageNumber); // Fetch paginated data in list mode
    }
  }, [pageNumber, filter, isGridView]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value;
    setFilter(newFilter);

    const params = new URLSearchParams(window.location.search);
    if (newFilter) {
      params.set('filter', newFilter);
    } else {
      params.delete('filter');
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);

    setData([]); // Reset data when filter changes
    setPageNumber(1); // Reset page to 1
    fetchData(newFilter, 1); // Fetch initial data
  };

  // Infinite scroll event listener in grid mode
  useEffect(() => {
    if (!isGridView) return;

    const handleScroll = () => {
      const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
      if (bottom) {
        loadMoreData();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadMoreData, isGridView]);

  const renderedData = isGridView ? (
    <div className="grid gap-0 w-full max-w-5xl mx-auto mt-8">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-0 bg-gray-200 p-4 font-semibold text-gray-700">
        <div className="col-span-3">Host</div>
        <div className="col-span-1">ID</div>
        <div className="col-span-3">Comment</div>
        <div className="col-span-2">Owner</div>
        <div className="col-span-2">IPs</div>
        <div className="col-span-1">Ports</div>
      </div>
      
      {/* Data Rows */}
      {data.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-12 gap-0 p-4 border-b hover:bg-blue-50 text-gray-800 transition-all duration-200"
        >
          <div className="col-span-3">{item.Host}</div>
          <div className="col-span-1">{item.ID}</div>
          <div className="col-span-3">{item.Comment}</div>
          <div className="col-span-2">{item.Owner}</div>
          <div className="col-span-2">
            {(item.IPs || []).map((ip, i) => (
              <div key={i}>{ip.Address}</div>
            ))}
          </div>
          <div className="col-span-1">
            {(item.Ports || []).map((port, i) => (
              <div key={i}>{port.Port}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ) : data.map((item, index) => (
    <div
      key={index}
      className="p-6 bg-white rounded-lg shadow-lg mb-6 border border-gray-200 hover:bg-blue-50 hover:shadow-md transition duration-300"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{`Host: ${item.Host}`}</h2>
      <div className="text-gray-600 space-y-1">
        <div className="md:flex md:space-x-2">
          <span className="font-semibold md:w-24 text-gray-700">ID:</span>
          <span className="text-gray-800">{item.ID}</span>
        </div>
        <div className="md:flex md:space-x-2">
          <span className="font-semibold md:w-24 text-gray-700">Comment:</span>
          <span className="text-gray-800">{item.Comment}</span>
        </div>
        <div className="md:flex md:space-x-2">
          <span className="font-semibold md:w-24 text-gray-700">Owner:</span>
          <span className="text-gray-800">{item.Owner}</span>
        </div>
        <div className="md:flex md:space-x-2">
          <span className="font-semibold md:w-24 text-gray-700">IPs:</span>
          <span className="text-gray-800">{(item.IPs || []).map((ip) => ip.Address).join(', ')}</span>
        </div>
        <div className="md:flex md:space-x-2">
          <span className="font-semibold md:w-24 text-gray-700">Ports:</span>
          <span className="text-gray-800">{(item.Ports || []).map((port) => port.Port).join(', ')}</span>
        </div>
      </div>
    </div>
  )
  
  );

  return (
    <main className="bg-gray-50">
      <Header
        filter={filter}
        onFilterChange={handleFilterChange}
        isGridView={isGridView}
        toggleView={() => setIsGridView(!isGridView)}
      />

      <section className="flex min-h-screen flex-col items-center py-12 pt-24 pb-20">
        {data.length === 0 ? (
          <p className="text-center text-gray-500">
            {isLoading ? 'Loading...' : 'No results found.'}
          </p>
        ) : (
          <div className={isGridView ? "overflow-x-auto w-full px-6" : "w-full max-w-2xl mx-auto px-6"}>
            {renderedData}
          </div>
        )}

        {isLoading && <p className="text-center text-gray-500 mt-4">Loading more data...</p>}
      </section>

      {/* Static footer for list view */}
      {!isGridView && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-md flex justify-between items-center">
          <button 
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
            disabled={pageNumber === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Page</span>
            <input
              type="text"
              value={inputPage}
              onChange={(e) => setInputPage(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') validatePageNumber();
              }}
              onBlur={validatePageNumber}
              className="w-12 text-center border border-gray-300 rounded"
              min={1}
              max={totalPages}
            />
            <span className="text-gray-600">of {totalPages}</span>
          </div>
          <button 
            onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages))}
            disabled={pageNumber === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </footer>
      )}
    </main>
  );
}
