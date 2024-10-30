"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import { DataTable } from '@/components/dataDisplay/DataTable';
import { DataList } from '@/components/dataDisplay/DataList';
import { PaginationFooter } from '@/components/dataDisplay/PaginationFooter';
import { useFetchData } from '@/hooks/useFetchData';

const pageSize = 10;

export default function HomePage() {
  const [isGridView, setIsGridView] = useState(false);
  const searchParams = useSearchParams();

  const { data, isLoading, pageNumber, setPageNumber, totalPages, filter, setFilter, loadMoreData } = 
  useFetchData(searchParams.get('filter') || '', isGridView, pageSize);

  // Filter callback to check filter state
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setPageNumber(1);
  }, [setFilter]);

  // Callback to toggle view mode
  const toggleView = useCallback(() => {
    setIsGridView((prev) => !prev);
    setPageNumber(1); 
  }, [isGridView]);

  const handleSetPageNumber = useCallback((newPage: number) => {
    setPageNumber(newPage);
  }, [setPageNumber]);

  
  return (
    <main className={`bg-gray-50 ${isGridView ? 'h-screen overflow-hidden':''}`}>
      <Header
        filter={filter}
        onFilterChange={handleFilterChange}
        isGridView={isGridView}
        toggleView={toggleView}
      />

      <section className={`flex ${isGridView ? 'h-full' : 'min-h-screen pt-24'} flex-col items-center py-12 pb-20`}>

        {data?.length === 0 ? (
          <p className="text-center text-gray-500">{isLoading ? 'Loading...' : 'No results found.'}</p>
        ) : (
          <div className={isGridView ? 'w-full px-6' : 'w-full max-w-2xl mx-auto px-6'}>
            {isGridView ? <DataTable data={data} loadMoreData={() => setPageNumber(prev => prev + 1)} /> : <DataList data={data} />}
          </div>
        )}

        {isLoading && <p className="text-center text-gray-500 mt-4">Loading more data...</p>}
      </section>

      {!isGridView && (
        <PaginationFooter
          pageNumber={pageNumber}
          setPageNumber={handleSetPageNumber}
          totalPages={totalPages}
        />
      )}
    </main>
  );
}
