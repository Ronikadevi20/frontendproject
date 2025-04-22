import { Search } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, passwordCategories }) => {
    return (
        <div className="glass-card p-4 mb-6 animate-fade-in">
            <div className="gap-4">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search passwords, bills and documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input pl-10 w-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchBar;