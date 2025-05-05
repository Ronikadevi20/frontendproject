import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, CreditCard, ArrowDownCircle, Paperclip, Loader2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import billsApi, { BillEntry } from '@/api/billsApi';
import { Download } from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const BillView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState<BillEntry | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    useEffect(() => {
        const fetchBill = async () => {
            if (!id) return;

            try {
                setIsLoading(true);
                const billData = await billsApi.get(id);
                setBill(billData);
            } catch (error) {
                toast.error('Failed to load bill details');
                navigate('/vault');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBill();
    }, [id]);
    const handleDownload = async (receiptUrl: string) => {
        try {
            const response = await fetch(receiptUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = receiptUrl.split('/').pop() || 'receipt';
            document.body.appendChild(a);

            if (typeof a.download === 'undefined') {
                window.open(url, '_blank');
            } else {
                a.click();
            }

            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            toast({
                title: "Download failed",
                description: "Could not download the receipt",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async () => {
        if (!id) return;

        try {
            setIsDeleting(true);
            await billsApi.delete(id);
            toast.success('Bill deleted successfully');
            navigate('/vault');
        } catch (error) {
            toast.error('Failed to delete bill');
            setIsDeleting(false);
        }
    };

    const handleMarkPaid = async () => {
        if (!id || !bill) return;

        try {
            setIsLoading(true);
            await billsApi.update(id, {
                ...bill,
                is_paid: true,
                payment_date: format(new Date(), 'yyyy-MM-dd')
            });

            // Update local state
            setBill(prev => prev ? {
                ...prev,
                is_paid: true,
                payment_date: format(new Date(), 'yyyy-MM-dd')
            } : null);

            toast.success('Bill marked as paid');
        } catch (error) {
            toast.error('Failed to update payment status');
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryLabel = (category: string) => {
        return category.replace('_', ' ').toLowerCase();
    };

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
                    <p className="ml-4 text-gray-600">Loading Bill Details</p>
                </div>
            </PageContainer >
        );
    }

    if (!bill) {
        return (
            <PageContainer>
                <div className="app-container py-8">
                    <div className="flex flex-col items-center justify-center h-64">
                        <p className="text-lg mb-4">Bill not found</p>
                        <Button onClick={() => navigate('/vault')}>Back to Vault</Button>
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="app-container py-8">
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => navigate('/vault')} className="mb-4">
                        <ArrowLeft className="mr-2" /> Back to Vault
                    </Button>
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">{bill.name}</h1>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/bills/edit/${id}`)}
                            >
                                <Edit size={18} className="mr-2" /> Edit
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Bill Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Category</p>
                                    <p className="font-medium">{getCategoryLabel(bill.category)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="text-xl font-bold">{Number(bill.amount)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Due Date</p>
                                    <p className="font-medium">
                                        {new Date(bill.due_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {bill.notes && (
                                    <div>
                                        <p className="text-sm text-gray-500">Notes</p>
                                        <p className="font-medium whitespace-pre-line">{bill.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4">Payment Status</h2>

                            <div className="mb-6">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${bill.is_paid
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {bill.is_paid ? 'Paid' : 'Unpaid'}
                                </div>
                            </div>

                            {bill.is_paid && bill.payment_date && (
                                <div className="mb-6">
                                    <p className="text-sm text-gray-500">Payment Date</p>
                                    <p className="font-medium">
                                        {new Date(bill.payment_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                            {!bill.is_paid && (
                                <Button
                                    onClick={handleMarkPaid}
                                    disabled={isLoading}
                                    className="w-full md:w-auto"
                                >
                                    <CreditCard size={18} className="mr-2" />
                                    Mark as Paid
                                </Button>
                            )}
                        </div>
                        {bill.receipt && (
                            <div className="mt-6 flex items-center justify-between rounded bg-gray-100 px-4 py-2">
                                <div className="flex items-center space-x-2">
                                    <Paperclip className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm">{bill.receipt.split('/').pop()}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleDownload(bill.receipt)}
                                    title="Download receipt"
                                >
                                    <ArrowDownCircle className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                                </Button>

                            </div>
                        )}

                    </div>
                </div>

                {bill.website_url && (
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {bill.website_url && (
                                <div>
                                    <p className="text-sm text-gray-500">Website</p>
                                    <a
                                        href={bill.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        {bill.website_url}
                                    </a>
                                </div>
                            )}

                            {bill.url && (
                                <div>
                                    <p className="text-sm text-gray-500">Payment URL</p>
                                    <a
                                        href={bill.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        {bill.url}
                                    </a>
                                </div>
                            )}

                            {bill.username && (
                                <div>
                                    <p className="text-sm text-gray-500">Username</p>
                                    <p className="font-medium">{bill.username}</p>
                                </div>
                            )}

                            {bill.password_value && (
                                <div>
                                    <p className="text-sm text-gray-500">Password</p>
                                    <p className="font-medium">••••••••</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the bill "{bill.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction data-testid="confirm-delete"
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageContainer>
    );
};

export default BillView;