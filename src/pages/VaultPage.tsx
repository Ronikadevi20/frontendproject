import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Eye, EyeOff, Trash2, Edit, ArrowUpDown, CreditCard, FileText, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { getCategoryById, passwordCategories } from '@/services/aiClassifier';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import SearchBar from '@/components/vault/SearchBar';
import UpcomingBillsSection from '@/components/vault/UpcomingBillingTable';
import CategoriesCards from '@/components/vault/CategoriesCards';
import BillsTable from '@/components/vault/BillsTable';
import passwordsApi from '@/api/passwordApi';
import billsApi from '@/api/billsApi';
import documentsApi from '@/api/documentsApi';
import ProductsTable from '@/components/vault/ProductsTable';

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
}

interface BillEntry {
    id: string;
    name: string;
    amount: string;
    due_date: string;
    is_paid: boolean;
    payment_date?: string;
    category: string;
    notes?: string;
    website_url?: string;
    username?: string;
    password_value?: string;
}
interface DocumentEntry {
    id: string;
    title: string;
    description?: string;
    file: string;
    file_name: string;
    file_type: string;
    file_size: number;
    upload_date: string;
    expiry_date?: string;
    is_expired: boolean;
    expires_soon: boolean;
    is_deleted: boolean;
    deleted_at?: string;
}



const VaultPage = () => {
    const navigate = useNavigate();
    const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
    const [bills, setBills] = useState<BillEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [sortField, setSortField] = useState<any>('website_url');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [documents, setDocuments] = useState<DocumentEntry[]>([]);


    const [activeTab, setActiveTab] = useState<'passwords' | 'bills' | 'documents'>(
        () => (sessionStorage.getItem('vaultActiveTab') as any) || 'passwords'
    );

    useEffect(() => {
        sessionStorage.setItem('vaultActiveTab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [passwordsRes, billsRes, documentsRes] = await Promise.all([
                    passwordsApi.list(),
                    billsApi.list(),
                    documentsApi.list()
                ]);

                setPasswords(passwordsRes as PasswordEntry[]);
                setBills(billsRes as BillEntry[]);
                setDocuments(documentsRes as DocumentEntry[]);

            } catch (error) {
                toast.error('Failed to load data');
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const toggleCategoryExpansion = (categoryId: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const getPasswordsByCategory = () => {
        const categorizedPasswords: Record<string, PasswordEntry[]> = {};

        passwordCategories.forEach(category => {
            categorizedPasswords[category.id] = passwords.filter(
                pwd => pwd.category === category.id &&
                    (searchQuery === '' ||
                        pwd.website_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        pwd.username.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        });

        const otherPasswords = passwords.filter(
            pwd => !passwordCategories.some(cat => cat.id === pwd.category) &&
                (searchQuery === '' ||
                    pwd.website_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    pwd.username.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        if (otherPasswords.length > 0) {
            categorizedPasswords['other'] = otherPasswords;
        }

        return categorizedPasswords;
    };

    const getCategoriesWithPasswords = () => {
        const passwordsByCategory = getPasswordsByCategory();
        return Object.keys(passwordsByCategory)
            .filter(categoryId => passwordsByCategory[categoryId].length > 0)
            .map(categoryId => {
                const category = getCategoryById(categoryId);
                return {
                    ...category,
                    count: passwordsByCategory[categoryId].length
                };
            });
    };

    const handleSort: any = (field: 'website_url' | 'username' | 'name' | 'due_date') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleDelete = (item: any) => {
        console.log('Deleting item:', item);
        setSelectedItem(item);
        setIsDeleteDialogOpen(true);
        console.log(selectedItem);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {

            // log the on that is active

            if (activeTab === 'passwords') {
                await passwordsApi.delete(selectedItem.id);
                setPasswords(prev => prev.filter(p => p.id !== selectedItem.id));
                toast.success('Password moved to trash');
            } else if (activeTab === 'bills') {
                await billsApi.delete(selectedItem.id);
                setBills(prev => prev.filter(b => b.id !== selectedItem.id));
                toast.success('Bill moved to trash');
            } else if (activeTab === 'documents') {
                await documentsApi.delete(selectedItem.id);
                setDocuments(prev => prev.filter(d => d.id !== selectedItem.id));
                toast.success('Document moved to trash');
            } else {
                throw new Error('Unknown item type');
            }
        } catch (error) {
            toast.error('Failed to delete item');
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };


    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const filteredPasswords = passwords
        .filter(pwd =>
            (activeTab === 'all' || activeTab === 'passwords') &&
            (!selectedCategory || pwd.category === selectedCategory) &&
            (pwd.website_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pwd.username.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
            const aValue = a[sortField]?.toLowerCase() || '';
            const bValue = b[sortField]?.toLowerCase() || '';
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });

    const filteredBills: any = bills
        .filter(bill =>
            (activeTab === 'all' || activeTab === 'bills') &&
            (!selectedCategory || bill.category === selectedCategory) &&
            bill.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortField === 'due_date') {
                const aDate = new Date(a.due_date).getTime();
                const bDate = new Date(b.due_date).getTime();
                return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
            } else {
                const aValue = a[sortField]?.toString().toLowerCase() || '';
                const bValue = b[sortField]?.toString().toLowerCase() || '';
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
        });

    const upcomingBills = bills.filter(bill => {
        if (bill.is_paid) return false;

        const dueDate = new Date(bill.due_date);
        const today = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(today.getDate() + 7);

        return dueDate >= today && dueDate <= sevenDaysLater;
    }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    const handleDownload = async (id: string) => {
        try {
            console.log(id)
            const blob = await documentsApi.download(id);
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = documents.find(d => d.id === id)?.file_name || 'document';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            toast.error('Failed to download document');
        }
    };

    const filteredDocuments = documents
        .filter(doc =>
            (activeTab === 'all' || activeTab === 'documents') &&
            doc.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortField === 'upload_date' || sortField === 'expiry_date') {
                const aDate = new Date(a[sortField] || 0).getTime();
                const bDate = new Date(b[sortField] || 0).getTime();
                return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
            } else {
                const aValue = a[sortField]?.toString().toLowerCase() || '';
                const bValue = b[sortField]?.toString().toLowerCase() || '';
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
        });


    return (
        <PageContainer>
            <div className="app-container py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Vault Manager</h1>
                        <p className="text-gray-600 mt-1">Secure your credentials, bills, and important documents</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate('/trash') }}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Trash
                        </Button>
                        <Button
                            onClick={() => {
                                if (sessionStorage.getItem('decoy_mode') === 'true') return;
                                switch (activeTab) {
                                    case 'passwords':
                                        navigate('/passwords/new');
                                        break;
                                    case 'bills':
                                        navigate('/bills/new');
                                        break;
                                    case 'documents':
                                        navigate('/documents/new');
                                        break;
                                    default:
                                        navigate('/create');
                                }
                            }}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New
                        </Button>
                    </div>
                </div>

                <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    passwordCategories={passwordCategories}
                />

                {/* <UpcomingBillsSection
                    upcomingBills={upcomingBills}
                    navigate={navigate}
                    setSearchQuery={setSearchQuery}
                    setSelectedCategory={setSelectedCategory}
                /> */}

                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
                    <TabsList className="mb-4">
                        {/* <TabsTrigger value="all">All Items</TabsTrigger> */}
                        <TabsTrigger value="passwords">Passwords</TabsTrigger>
                        <TabsTrigger value="bills">Bills</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    {/* <TabsContent value="all" className="mt-0">
                        {filteredPasswords.length === 0 && filteredBills.length === 0 && (
                            <div className="text-center py-12 glass-card">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                <p className="mt-4 text-lg text-gray-600">No items found</p>
                                <p className="text-gray-500 mb-4">Start securing your passwords and managing your bills</p>
                                <Button onClick={() => navigate('/passwords/new')}>
                                    Add Your First Item
                                </Button>
                            </div>
                        )}
                    </TabsContent> */}

                    <TabsContent value="passwords" className="mt-0">
                        <CategoriesCards
                            passwords={filteredPasswords}
                            visiblePasswords={visiblePasswords}
                            togglePasswordVisibility={togglePasswordVisibility}
                            copyToClipboard={copyToClipboard}
                            handleSort={handleSort}
                            sortField={sortField}
                            sortDirection={sortDirection}
                            handleDelete={handleDelete}
                            navigate={navigate}
                        />
                    </TabsContent>

                    <TabsContent value="bills" className="mt-0">
                        <BillsTable
                            bills={filteredBills}
                            handleDelete={handleDelete}
                            sortField={sortField}
                            sortDirection={sortDirection}
                            handleSort={handleSort}
                            navigate={navigate}
                        />
                    </TabsContent>

                    <TabsContent value="documents" className="mt-0">
                        <ProductsTable
                            documents={filteredDocuments}
                            handleSort={handleSort}
                            sortField={sortField}
                            sortDirection={sortDirection}
                            handleDelete={handleDelete}
                            navigate={navigate}
                            handleDownload={handleDownload}
                        />
                    </TabsContent>
                </Tabs>

                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to move this item to trash?</p>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Move to Trash
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </PageContainer>
    );
};

export default VaultPage;