import { CreditCard, Edit, Trash2, ArrowUpDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import billsApi, { BillEntry } from '@/api/billsApi';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '../layout/PageContainer';

interface BillsTableProps {
    bills: BillEntry[];
    handleSort: (field: 'name' | 'amount' | 'due_date') => void;
    sortField: string;
    sortDirection: 'asc' | 'desc';
    handleDelete: (bill: BillEntry) => void;
    navigate: (path: string) => void;
}

const BillsTable = ({
    bills,
    handleSort,
    sortField,
    sortDirection,
    handleDelete,
    navigate
}: BillsTableProps) => {
    const [isDecoyMode, setIsDecoyMode] = useState(false);
    const [displayedBills, setDisplayedBills] = useState<BillEntry[]>(bills);
    const {
        data: fetchedBills = [],
        isLoading
    } = useQuery<BillEntry[], Error>({
        queryKey: ['bills'],
        queryFn: billsApi.list
    });

    useEffect(() => {
        const decoyMode = sessionStorage.getItem('is_decoy_login') === 'true';
        setIsDecoyMode(decoyMode);

        if (decoyMode) {
            // Generate decoy bills data
            const decoyBills: any[] = [
                {
                    id: '1',
                    name: 'Netflix Subscription',
                    amount: '14.99',
                    due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
                    is_paid: false,
                    website_url: 'netflix.com',
                    payment_date: null
                },
                {
                    id: '2',
                    name: 'Spotify Premium',
                    amount: '9.99',
                    due_date: new Date(Date.now() - 86400000 * 2).toISOString(),
                    is_paid: false,
                    website_url: 'spotify.com',
                    payment_date: null
                },
                {
                    id: '3',
                    name: 'Electric Bill',
                    amount: '75.50',
                    due_date: new Date(Date.now() + 86400000 * 1).toISOString(),
                    is_paid: true,
                    website_url: 'electric-company.com',
                    payment_date: new Date(Date.now() - 86400000 * 1).toISOString()
                }
            ];
            setDisplayedBills(decoyBills);
        } else {
            setDisplayedBills(bills);
        }
    }, [bills]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
                <p className="ml-4 text-gray-600">Loading bills </p>
            </div>
        );
    }

    if (displayedBills.length === 0) {
        return (
            <div className="text-center py-12 glass-card">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-lg text-gray-600">No bills found</p>
                <p className="text-gray-500 mb-4">Start tracking your bills and subscriptions</p>
                <Button onClick={() => navigate('/bills/new')}>
                    Add Your First Bill
                </Button>
            </div>
        );
    }

    const getStatusBadge = (isPaid: boolean) => {
        return isPaid ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
        ) : (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Unpaid</Badge>
        );
    };

    const getDueDateStatus = (dueDate: string, isPaid: boolean) => {
        if (isPaid) return null;

        const today = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 3 && diffDays >= 0) {
            return <div className="text-xs text-red-500 font-medium">Due soon!</div>;
        } else if (diffDays < 0) {
            return <div className="text-xs text-red-600 font-medium">Overdue</div>;
        }
        return null;
    };

    return (
        <div className="glass-card animate-slide-in overflow-x-auto">
            <h3 className="px-6 py-3 bg-gray-50 font-medium flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                Bills
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    onClick={() => handleSort('name')}
                                    className="flex items-center space-x-1 focus:outline-none"
                                >
                                    <span>Bill Name</span>
                                    {sortField === 'name' && (
                                        <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    onClick={() => handleSort('due_date')}
                                    className="flex items-center space-x-1 focus:outline-none"
                                >
                                    <span>Due Date</span>
                                    {sortField === 'due_date' && (
                                        <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {displayedBills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{bill.name}</div>
                                    {bill.website_url && (
                                        <div className="text-xs text-gray-500">
                                            {bill.website_url}
                                            {bill.website_url && (
                                                <a
                                                    href={bill.website_url.startsWith('http') ? bill.website_url : `https://${bill.website_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-1 text-blue-600 hover:underline"
                                                >
                                                    {sessionStorage.getItem('decoy_mode') === 'true' && "Visit Site"}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">${parseFloat(bill.amount).toFixed(2)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>{format(new Date(bill.due_date), 'MMM d, yyyy')}</div>
                                    {getDueDateStatus(bill.due_date, bill.is_paid)}
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(bill.is_paid)}
                                    {bill.is_paid && bill.payment_date && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Paid on {format(new Date(bill.payment_date), 'MMM d, yyyy')}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (sessionStorage.getItem('is_decoy_login') !== 'true') {
                                                    { sessionStorage.getItem('decoy_mode') !== 'true' && navigate(`/bills/view/${bill.id}`) };
                                                }
                                            }}>
                                            <Eye size={16} />
                                            <span className="sr-only">View</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate(`/bills/edit/${bill.id}`) }}
                                        >
                                            <Edit size={16} />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && handleDelete(bill) }}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default BillsTable;