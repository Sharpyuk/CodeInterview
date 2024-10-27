import React from 'react';
import Logo from '~/svg/Logo.svg';
import GridIcon from '~/svg/Grid.svg';
import TableIcon from '~/svg/Table.svg';
import Link from 'next/link';

type HeaderProps = {
  filter: string;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isGridView: boolean;
  toggleView: () => void;
};

export default function Header({
  filter,
  onFilterChange,
  isGridView,
  toggleView,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between fixed top-0 left-0 right-0 z-50 bg-blue-500 p-4 text-white">
      <div className="flex items-center space-x-2">
          <Logo className="w-8 h-8" />
        </div>
      <input
        type="text"
        placeholder="Filter by hostname..."
        value={filter}
        onChange={onFilterChange}
        className="w-full max-w-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all duration-300 ease-linear"
      />

      <div className="flex items-center space-x-2">
        <button onClick={toggleView} className="p-2 bg-blue-600 rounded-3xl hover:rounded-xl hover:bg-blue-700 hover:shadow-lg">
          {isGridView ? <GridIcon  className="w-6 h-6" />:<TableIcon  className="w-6 h-6"/>}
        </button>
      </div>
    </header>
  );
}
