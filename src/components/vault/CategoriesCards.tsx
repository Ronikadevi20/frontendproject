import { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2, Edit, ArrowUpDown, Plus, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryById } from '@/services/aiClassifier';
import PasswordsTable from './PasswordsTable';
import { Label } from '../ui/label';
import { Select } from '../ui/select';

interface PasswordEntry {
    id: string;
    website_url: string;
    name: string;
    username: string;
    password_value: string;
    notes?: string;
    category: string;
    created_at: string;
    updated_at: string;
    url?: string;
}

interface CategoryCardsProps {
    passwords?: PasswordEntry[];
    visiblePasswords: Record<string, boolean>;
    togglePasswordVisibility: (id: string) => void;
    copyToClipboard: (text: string) => void;
    handleSort: (field: 'website_url' | 'username' | 'name' | 'dueDate') => void;
    sortField: 'website_url' | 'username' | 'name' | 'dueDate';
    sortDirection: 'asc' | 'desc';
    handleDelete: (pwd: PasswordEntry) => void;
    navigate: (path: string) => void;
}

const CATEGORY_DEFAULTS = {
    'SOCIAL': { name: 'Social Media', color: '#3498DB' },
    'WORK': { name: 'Work', color: '#2ECC71' },
    'FINANCE': { name: 'Finance', color: '#F1C40F' },
    'SHOPPING': { name: 'Shopping', color: '#9B59B6' },
    'ENTERTAINMENT': { name: 'Entertainment', color: '#E74C3C' },
    'OTHER': { name: 'Other', color: '#7F8C8D' },
    'Uncategorized': { name: 'Uncategorized', color: '#95A5A6' }
};

const DECOY_PASSWORDS: PasswordEntry[] = [
    {
        id: '1',
        website_url: 'facebook.com',
        name: 'Facebook Account',
        username: 'user@example.com',
        password_value: '••••••••',
        category: 'SOCIAL',
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 7).toISOString()
    },
    {
        id: '2',
        website_url: 'bank.com',
        name: 'Online Banking',
        username: 'john.doe@example.com',
        password_value: '••••••••',
        category: 'FINANCE',
        created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 14).toISOString()
    },
    {
        id: '3',
        website_url: 'amazon.com',
        name: 'Amazon Shopping',
        username: 'jane.doe@example.com',
        password_value: '••••••••',
        category: 'SHOPPING',
        created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 21).toISOString()
    },
    {
        id: '4',
        website_url: 'company.com',
        name: 'Work Email',
        username: 'john@company.com',
        password_value: '••••••••',
        category: 'WORK',
        created_at: new Date(Date.now() - 86400000 * 120).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 28).toISOString()
    }
];

const CategoryCards = ({
    passwords = [],
    visiblePasswords,
    togglePasswordVisibility,
    copyToClipboard,
    handleSort,
    sortField,
    sortDirection,
    handleDelete,
    navigate
}: CategoryCardsProps) => {
    const [isDecoyMode, setIsDecoyMode] = useState(false);
    const [displayedPasswords, setDisplayedPasswords] = useState<PasswordEntry[]>(passwords);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'categories' | 'table'>('categories');

    useEffect(() => {
        const decoyMode = sessionStorage.getItem('is_decoy_login') === 'true';
        setIsDecoyMode(decoyMode);

        if (decoyMode) {
            setDisplayedPasswords(DECOY_PASSWORDS);
        } else {
            setDisplayedPasswords(passwords);
        }
    }, [passwords]);

    const passwordsByCategory = displayedPasswords.reduce((acc, pwd) => {
        const category = pwd.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(pwd);
        return acc;
    }, {} as Record<string, PasswordEntry[]>);

    const getCategoryInfo = (categoryId: string) => {
        const serviceCategory = getCategoryById(categoryId);
        if (serviceCategory?.name && serviceCategory.name !== 'Other') {
            return serviceCategory;
        }
        return CATEGORY_DEFAULTS[categoryId as keyof typeof CATEGORY_DEFAULTS] || {
            name: categoryId,
            color: '#95A5A6'
        };
    };

    const categories = Object.keys(passwordsByCategory).map(categoryId => {
        const categoryInfo = getCategoryInfo(categoryId);
        return {
            id: categoryId,
            name: categoryInfo?.name || categoryId,
            color: categoryInfo?.color || '#95A5A6',
            count: passwordsByCategory[categoryId]?.length || 0
        };
    });

    const filteredPasswords = selectedCategory
        ? passwordsByCategory[selectedCategory] || []
        : displayedPasswords;

    const formatCategoryName = (categoryId: string | null) => {
        if (!categoryId) return 'Uncategorized';
        const info = getCategoryInfo(categoryId);
        return info?.name || categoryId;
    };

    const handleCategoryClick = (categoryId: string | null) => {
        setSelectedCategory(categoryId);
        setViewMode('table');
    };

    const handleBackClick = () => {
        setViewMode('categories');
    };

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value === 'all' ? null : event.target.value;
        setSelectedCategory(selectedValue);
        setViewMode(selectedValue ? 'table' : 'categories');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {viewMode === 'categories' ? (
                <>
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold">Password Categories</h2>

                        <div className="flex items-center gap-4">
                            <Label htmlFor="category-select" className="sr-only">Filter by Category</Label>
                            <select
                                id="category-select"
                                value={selectedCategory || 'all'}
                                onChange={handleCategoryChange}
                                className="border rounded-md p-2"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                            <Button
                                onClick={() => navigate('/passwords/new')}
                                className="flex items-center gap-2"
                                disabled={isDecoyMode}
                            >
                                <Plus size={16} />
                                Add Password
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <div
                            className="glass-card p-6 rounded-lg shadow-sm cursor-pointer transform transition hover:shadow-md hover:scale-105"
                            onClick={() => handleCategoryClick(null)}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium">All Passwords</h3>
                                <Badge variant="outline" className="bg-gray-100">
                                    {displayedPasswords.length}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500">View all your saved passwords</p>
                            <div className="flex justify-end mt-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-500"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCategoryClick(null);
                                    }}
                                >
                                    <Eye size={16} className="mr-1" />
                                    View
                                </Button>
                            </div>
                        </div>
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="glass-card p-6 rounded-lg shadow-sm cursor-pointer transform transition hover:shadow-md hover:scale-105"
                                onClick={() => handleCategoryClick(category.id)}
                                style={{
                                    borderLeft: `4px solid ${category.color}`,
                                }}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-medium">{category.name}</h3>
                                    <Badge
                                        className="text-xs"
                                        style={{
                                            backgroundColor: `${category.color}20`,
                                            color: category.color,
                                            borderColor: `${category.color}50`
                                        }}
                                    >
                                        {category.count}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {category.count} password{category.count !== 1 ? 's' : ''}
                                </p>
                                <div className="flex justify-end mt-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-500"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCategoryClick(category.id);
                                        }}
                                    >
                                        <Eye size={16} className="mr-1" />
                                        View
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBackClick}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Categories
                        </Button>

                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold">
                                {selectedCategory === null ? 'All' : formatCategoryName(selectedCategory)} Passwords
                            </h2>
                            <Badge
                                className="text-xs"
                                style={{
                                    backgroundColor: selectedCategory ?
                                        `${getCategoryInfo(selectedCategory).color}20` :
                                        '#3498DB20',
                                    color: selectedCategory ?
                                        getCategoryInfo(selectedCategory).color :
                                        '#3498DB',
                                    borderColor: selectedCategory ?
                                        `${getCategoryInfo(selectedCategory).color}50` :
                                        '#3498DB50'
                                }}
                            >
                                {filteredPasswords.length}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex justify-end mb-4">
                        <div className="flex items-center gap-4">
                            <Label htmlFor="category-select" className="sr-only">Filter by Category</Label>
                            <select
                                id="category-select"
                                value={selectedCategory || 'all'}
                                onChange={handleCategoryChange}
                                className="border rounded-md p-2"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                            <Button
                                onClick={() => navigate('/passwords/new')}
                                className="flex items-center gap-2"
                                disabled={isDecoyMode}
                            >
                                <Plus size={16} />
                                Add Password
                            </Button>
                        </div>
                    </div>

                    <PasswordsTable
                        passwords={filteredPasswords}
                        visiblePasswords={visiblePasswords}
                        togglePasswordVisibility={togglePasswordVisibility}
                        copyToClipboard={copyToClipboard}
                        handleSort={handleSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        handleDelete={isDecoyMode ? () => { } : handleDelete}
                        navigate={navigate}
                    />
                </>
            )}
        </div>
    );
};

export default CategoryCards;