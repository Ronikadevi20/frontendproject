import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { TextField, AmountField, TextAreaField } from '@/components/bills/BillFormFields';
import BillDatePicker from '@/components/bills/BillDatePicker';
import BillPaymentStatus from '@/components/bills/BillPaymentStatus';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import billsApi, { BillCreateDTO, BillEntry } from '@/api/billsApi';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';  // Make sure to import axios if not already done

interface BillData {
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
    url?: string;
    receipt?: File | string | null; // Can be File (new upload), string (existing URL), or null
}

interface ErrorState {
    [key: string]: string;
}

const BillEntryForm = () => {
    const { id, view } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showCredentials, setShowCredentials] = useState<boolean>(false);
    const [errors, setErrors] = useState<ErrorState>({});
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const markPaidFromView = searchParams.get("markPaid") === "true";

    const [billData, setBillData] = useState<BillData>({
        name: '',
        amount: '',
        due_date: format(new Date(), 'yyyy-MM-dd'),
        is_paid: false,
        category: 'BILLS',
        notes: '',
        receipt: null,
    });

    useEffect(() => {
        const fetchBill = async () => {
            if (!isEditMode || !id) return;

            try {
                setIsLoading(true);
                const bill = await billsApi.get(id);

                const updatedData: BillData = {
                    name: bill.name,
                    amount: bill.amount,
                    due_date: bill.due_date,
                    is_paid: markPaidFromView ? true : bill.is_paid,
                    payment_date: markPaidFromView ? format(new Date(), 'yyyy-MM-dd') : bill.payment_date,
                    category: bill.category,
                    notes: bill.notes,
                    website_url: bill.website_url,
                    username: bill.username,
                    password_value: bill.password_value,
                    url: bill.url,
                    receipt: bill.receipt || null
                };

                setBillData(updatedData);

                if (typeof updatedData.receipt === 'string') {
                    setReceiptPreview(updatedData.receipt);
                }

                if (
                    updatedData.website_url ||
                    updatedData.username ||
                    updatedData.password_value ||
                    updatedData.url
                ) {
                    setShowCredentials(true);
                }

                if (markPaidFromView) {
                    toast.info('Bill marked as paid — confirm and save.');
                }
            } catch (error) {
                toast.error('Failed to load bill details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBill();
    }, [isEditMode, id, markPaidFromView]);


    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBillData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Check file type (allow images and PDFs)
            if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
                toast.error('Please upload an image or PDF file');
                return;
            }

            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }

            setBillData(prev => ({ ...prev, receipt: file }));

            // Create preview for images
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setReceiptPreview(event.target?.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setReceiptPreview(null); // No preview for PDFs
            }
        }
    };

    const handleRemoveReceipt = () => {
        setBillData(prev => ({ ...prev, receipt: null }));
        setReceiptPreview(null);
    };

    const handleDateChange = (date: string, field: 'due_date' | 'payment_date') => {
        setBillData(prev => ({ ...prev, [field]: date }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handlePaymentStatus = (isPaid: boolean) => {
        setBillData(prev => ({
            ...prev,
            is_paid: isPaid,
            payment_date: isPaid ? format(new Date(), 'yyyy-MM-dd') : undefined
        }));
    };

    const validateForm = () => {
        const newErrors: ErrorState = {};
        if (!billData.name.trim()) newErrors.name = 'Bill name is required';
        if (!billData.amount || parseFloat(billData.amount) <= 0) newErrors.amount = 'Valid amount required';
        if (!billData.due_date) newErrors.due_date = 'Due date required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            // Create form data object
            const formData = new FormData();
            formData.append('name', billData.name);
            formData.append('amount', parseFloat(billData.amount).toFixed(2));
            formData.append('due_date', billData.due_date);
            formData.append('is_paid', billData.is_paid.toString());
            formData.append('category', billData.category);

            if (billData.notes) formData.append('notes', billData.notes);
            if (billData.website_url) formData.append('website_url', billData.website_url);
            if (billData.username) formData.append('username', billData.username);
            if (billData.password_value) formData.append('password_value', billData.password_value);
            if (billData.payment_date) formData.append('payment_date', billData.payment_date);

            // Add file if it exists
            if (billData.receipt instanceof File) {
                formData.append('receipt', billData.receipt);
            } else if (billData.receipt === null && isEditMode) {
                // ✅ This ensures the backend deletes the file
                formData.append('receipt', '');
            }
            let response;
            // Use axios directly for the file upload
            if (isEditMode && id) {
                response = await axios.put(`http://127.0.0.1:8000/api/bills/${id}/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${sessionStorage.getItem("auth_token")}`
                    }
                });

                console.log(response)
            } else {
                response = await axios.post('http://127.0.0.1:8000/api/bills/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${sessionStorage.getItem("auth_token")}`
                    }
                });
                console.log(response)
            }

            toast.success(isEditMode ? 'Bill updated successfully' : 'Bill created successfully');
            navigate('/vault');
        } catch (error) {
            console.error("Submission error:", error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="app-container py-8">
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => navigate('/vault')} className="mb-4">
                        <ArrowLeft className="mr-2" /> Back to Vault
                    </Button>
                    <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Bill' : 'New Bill'}</h1>
                    <p className="text-gray-600 mt-2">
                        {isEditMode ? 'Update bill details' : 'Add new bill to your vault'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextField
                            id="name"
                            label="Bill Name*"
                            name="name"
                            value={billData.name}
                            onChange={handleChange}
                            error={errors.name}
                        />
                        <AmountField
                            id="amount"
                            label="Amount*"
                            name="amount"
                            value={billData.amount}
                            onChange={handleChange}
                            error={errors.amount}
                        />

                        <div>
                            <label className="block text-sm font-medium mb-1">Category*</label>
                            <select
                                name="category"
                                value={billData.category}
                                onChange={handleChange}
                                className="form-input"
                            >
                                {[
                                    'UTILITIES', 'SUBSCRIPTION', 'LOAN',
                                    'INSURANCE', 'CREDIT_CARD', 'RENT',
                                    'BILLS', 'OTHER'
                                ].map(opt => (
                                    <option key={opt} value={opt}>
                                        {opt.replace('_', ' ').toLowerCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <BillDatePicker
                            label="Due Date*"
                            date={billData.due_date}
                            onDateChange={(date) => handleDateChange(date, 'due_date')}
                            error={errors.due_date}
                        />

                        <BillPaymentStatus
                            isPaid={billData.is_paid}
                            onTogglePaid={handlePaymentStatus}
                        />

                        {billData.is_paid && (
                            <BillDatePicker
                                label="Payment Date"
                                date={billData.payment_date || ''}
                                onDateChange={(date) => handleDateChange(date, 'payment_date')}
                            />
                        )}

                        {/* Receipt Upload Section */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Receipt</label>
                            <div className="flex items-center gap-4">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-gray-500" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG, or PDF (MAX. 5MB)</p>
                                    </div>
                                    <input
                                        id="receipt"
                                        name="receipt"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/*,.pdf"
                                    />
                                </label>

                                {receiptPreview && (
                                    <div className="relative">
                                        {receiptPreview.match(/^data:image/) ? (
                                            <img
                                                src={receiptPreview}
                                                alt="Receipt preview"
                                                className="h-32 w-auto object-contain rounded border"
                                            />
                                        ) : (
                                            <div className="h-32 w-32 flex items-center justify-center bg-gray-100 rounded border">
                                                <span className="text-sm text-gray-500">PDF Receipt</span>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleRemoveReceipt}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {billData.receipt instanceof File && (
                                <p className="mt-2 text-sm text-gray-600">
                                    {billData.receipt.name} ({Math.round(billData.receipt.size / 1024)} KB)
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <TextAreaField
                                id="notes"
                                label="Notes"
                                name="notes"
                                value={billData.notes || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 justify-end">
                        <Button variant="outline" onClick={() => navigate('/vault')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Bill'}
                        </Button>
                    </div>
                </form>
            </div>
        </PageContainer>
    );
};

export default BillEntryForm;