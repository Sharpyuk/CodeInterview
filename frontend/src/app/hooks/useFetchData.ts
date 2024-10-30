import { useEffect, useState, useCallback, useRef } from 'react';

export function useFetchData(initialFilter: string, isGridView: boolean, pageSize: number) {
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState(initialFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const loadMoreData = useCallback(() => {
    if (!isLoading && pageNumber < totalPages) {
      setPageNumber(prevPage => prevPage + 1);
    }
  }, [isLoading, pageNumber, totalPages]);
  const prevFilter = useRef(filter);

  useEffect(() => {
    // Calculate assetOffset each time `pageNumber` changes
    const assetOffset = (pageNumber - 1) * pageSize;
    console.log("Fetching with assetOffset:", assetOffset);  // Debug output

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/assets?filter=${filter}&maxAssets=1000&assetOffset=${assetOffset}`
        );
        const result = await response.json();
        //setData(prevData => isGridView ? [...prevData, ...result.assets || []] : result.assets);
        setData(prevData => {
            if (!prevData) {return result.assets}
            
            // Map over current data IDs for quick lookup
            const existingIds = new Set(prevData.map(item => item.ID)); // Adjust to your unique key
          
            // Filter out items already in prevData
            const newData = (result.assets || []).filter(item => !existingIds.has(item.ID)); 
          
            return isGridView ? [...prevData, ...newData] : result.assets;
        });

        setTotalPages(result.total_pages || 1);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filter, pageNumber, isGridView, pageSize]);

  return {
    data,
    isLoading,
    pageNumber,
    setPageNumber,
    totalPages,
    filter,
    setFilter: (newFilter) => {
        prevFilter.current = filter; // Update the previous filter before changing
        setPageNumber(1); // Reset page number
        setData([]); // Clear data on filter change
        setFilter(newFilter); // Update filter
      },
    loadMoreData
  };
}
