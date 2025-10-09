import { useState } from "react";
import { Filter, SortAsc, SortDesc, Calendar, FileText } from "lucide-react";

export type SortOption = 'date-asc' | 'date-desc' | 'title-asc' | 'title-desc';
export type FilterOption = 'all' | 'memorie' | 'first step';

interface GalleryFiltersProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterBy: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

const sortOptions = [
  { value: 'date-desc' as SortOption, label: 'Date (récent)', icon: SortDesc },
  { value: 'date-asc' as SortOption, label: 'Date (ancien)', icon: SortAsc },
  { value: 'title-asc' as SortOption, label: 'Titre (A-Z)', icon: FileText },
  { value: 'title-desc' as SortOption, label: 'Titre (Z-A)', icon: FileText },
];

const filterOptions = [
  { value: 'all' as FilterOption, label: 'Toutes', icon: Filter },
  { value: 'memorie' as FilterOption, label: 'Souvenirs', icon: Calendar },
  { value: 'first step' as FilterOption, label: 'Étapes', icon: FileText },
];

export default function GalleryFilters({
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange
}: GalleryFiltersProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const currentSort = sortOptions.find(option => option.value === sortBy);
  const currentFilter = filterOptions.find(option => option.value === filterBy);

  return (
    <div className="flex gap-2 mb-4">
      {/* Sort Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowSortMenu(!showSortMenu)}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
        >
          {currentSort && <currentSort.icon size={16} />}
          <span>{currentSort?.label}</span>
        </button>
        
        {showSortMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[160px]">
            {sortOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                    sortBy === option.value ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <IconComponent size={16} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowFilterMenu(!showFilterMenu)}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
        >
          {currentFilter && <currentFilter.icon size={16} />}
          <span>{currentFilter?.label}</span>
        </button>
        
        {showFilterMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[140px]">
            {filterOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onFilterChange(option.value);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                    filterBy === option.value ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <IconComponent size={16} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
