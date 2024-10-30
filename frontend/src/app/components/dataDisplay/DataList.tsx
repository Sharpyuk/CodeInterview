import React from 'react';

export function DataList({ data }: { data: any[] }) {
    const sortedArray = (data || []).sort((a, b) => a.Host.localeCompare(b.Host));
    if ((data || []).length === 0) {
        return <p className="text-center text-gray-500">No results found.</p>;
    }

    return (
        <>
        {
            sortedArray.map((item, index) => (
            <div key={index} className="p-6 bg-white rounded-lg shadow-lg mb-6 border border-gray-200 hover:bg-blue-50 hover:shadow-md transition duration-300">
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
        ))}
    </>
  );
}
