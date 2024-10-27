import React, { useState, useEffect } from 'react';

export function PaginationFooter({ pageNumber, setPageNumber, totalPages }: any) {
  const [inputPage, setInputPage] = useState(pageNumber);

  useEffect(() => setInputPage(pageNumber), [pageNumber]);

  const validatePageNumber = () => {
    const newPageNumber = inputPage < 1 ? 1 : Math.min(inputPage, totalPages);
    setPageNumber(newPageNumber);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-md flex justify-between items-center">
      <button 
        onClick={() => setPageNumber((prev: any) => Math.max(prev - 1, 1))}
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
          onKeyDown={(e) => { if (e.key === 'Enter') validatePageNumber(); }}
          onBlur={validatePageNumber}
          className="w-12 text-center border border-gray-300 rounded"
        />
        <span className="text-gray-600">of {totalPages}</span>
      </div>
      <button 
        onClick={() => setPageNumber((prev: any) => Math.min(prev + 1, totalPages))}
        disabled={pageNumber === totalPages}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Next
      </button>
    </footer>
  );
}
