import { Package, Edit, Trash2, ArrowUpDown, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import documentsApi, { DocumentEntry } from '@/api/documentsApi';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ProductsTableProps {
    documents: DocumentEntry[];
    handleSort: (field: 'title' | 'upload_date' | 'expiry_date') => void;
    sortField: string;
    sortDirection: 'asc' | 'desc';
    handleDelete: (document: DocumentEntry) => void;
    navigate: (path: string) => void;
    handleDownload: (id: string) => void;
}

const ProductsTable = ({
    documents,
    handleSort,
    sortField,
    sortDirection,
    handleDelete,
    navigate,
    handleDownload
}: ProductsTableProps) => {
    const [isDecoyMode, setIsDecoyMode] = useState(false);
    const [displayedDocuments, setDisplayedDocuments] = useState<DocumentEntry[]>([]);
    const { data: fetchedDocuments = [], isLoading } = useQuery<DocumentEntry[], Error>({
        queryKey: ['documents'],
        queryFn: () => documentsApi.list(),  // ← this is the key fix
    });

    useEffect(() => {
        setDisplayedDocuments(fetchedDocuments);
    }, [fetchedDocuments]);
    useEffect(() => {
        const decoyMode = sessionStorage.getItem('is_decoy_login') === 'true';
        setIsDecoyMode(decoyMode);

        if (decoyMode) {
            // Generate decoy documents data
            const currentDate = new Date();
            const decoyDocuments: any[] = [
                {
                    id: '1',
                    title: 'Passport Copy',
                    description: 'Scanned copy of passport',
                    file_type: 'PDF',
                    file_size: 1024 * 250, // 250KB
                    upload_date: new Date(currentDate.getTime() - 86400000 * 30).toISOString(),
                    expiry_date: new Date(currentDate.getTime() + 86400000 * 365).toISOString(),
                    is_expired: false,
                    expires_soon: false
                },
                {
                    id: '2',
                    title: 'Driver License',
                    description: 'Front and back scan',
                    file_type: 'IMG',
                    file_size: 1024 * 1800, // 1.8MB
                    upload_date: new Date(currentDate.getTime() - 86400000 * 60).toISOString(),
                    expiry_date: new Date(currentDate.getTime() + 86400000 * 30).toISOString(),
                    is_expired: false,
                    expires_soon: true
                },
                {
                    id: '3',
                    title: 'Insurance Policy',
                    description: 'Annual health insurance document',
                    file_type: 'PDF',
                    file_size: 1024 * 1500, // 1.5MB
                    upload_date: new Date(currentDate.getTime() - 86400000 * 90).toISOString(),
                    expiry_date: new Date(currentDate.getTime() - 86400000 * 15).toISOString(),
                    is_expired: true,
                    expires_soon: false
                },
                {
                    id: '4',
                    title: 'Tax Return 2023',
                    description: 'Filed tax documents',
                    file_type: 'PDF',
                    file_size: 1024 * 800, // 800KB
                    upload_date: new Date(currentDate.getTime() - 86400000 * 120).toISOString(),
                    expiry_date: null,
                    is_expired: false,
                    expires_soon: false
                }
            ];
            setDisplayedDocuments(decoyDocuments);
        } else {
            setDisplayedDocuments(documents);
        }
    }, [documents]);
    if (isLoading) {
        return (
            <div className="text-center py-12 glass-card animate-pulse">
                <p className="text-lg text-gray-600">Loading documents...</p>
            </div>
        );
    }
    if (displayedDocuments.length === 0) {
        return (
            <div className="text-center py-12 glass-card">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-lg text-gray-600">No documents found</p>
                <p className="text-gray-500 mb-4">Upload your first document to get started</p>
                <Button onClick={() => navigate('/documents/new')}>
                    Upload Document
                </Button>
            </div>
        );
    }

    const getStatusBadge = (document: DocumentEntry) => {
        if (document.is_expired) {
            return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>;
        }
        if (document.expires_soon) {
            return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Expiring Soon</Badge>;
        }
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    };

    const getFileTypeIcon = (fileType: string) => {
        switch (fileType) {
            case 'PDF':
                return <span className="text-red-500">PDF</span>;
            case 'DOC':
                return <span className="text-blue-500">DOC</span>;
            case 'IMG':
                return <span className="text-green-500">IMG</span>;
            case 'XLS':
                return <span className="text-green-600">XLS</span>;
            case 'PPT':
                return <span className="text-orange-500">PPT</span>;
            default:
                return <span className="text-gray-500">FILE</span>;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="glass-card animate-slide-in overflow-x-auto">
            <h3 className="px-6 py-3 bg-gray-50 font-medium flex items-center">
                <Package className="w-5 h-5 mr-2 text-gray-600" />
                Documents
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    onClick={() => handleSort('title')}
                                    className="flex items-center space-x-1 focus:outline-none"
                                >
                                    <span>Document Name</span>
                                    {sortField === 'title' && (
                                        <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Size
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    onClick={() => handleSort('upload_date')}
                                    className="flex items-center space-x-1 focus:outline-none"
                                >
                                    <span>Upload Date</span>
                                    {sortField === 'upload_date' && (
                                        <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    onClick={() => handleSort('expiry_date')}
                                    className="flex items-center space-x-1 focus:outline-none"
                                >
                                    <span>Expiry Date</span>
                                    {sortField === 'expiry_date' && (
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
                        {displayedDocuments.map((document) => (
                            <tr key={document.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{document.title}</div>
                                    {document.description && (
                                        <div className="text-xs text-gray-500 truncate max-w-xs">
                                            {document.description}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {getFileTypeIcon(document.file_type)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm">{formatFileSize(document.file_size)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>{format(new Date(document.upload_date), 'MMM d, yyyy')}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {document.expiry_date ? (
                                        <div>{format(new Date(document.expiry_date), 'MMM d, yyyy')}</div>
                                    ) : (
                                        <div className="text-gray-400">No expiry</div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(document)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && handleDownload(document.id) }}
                                            disabled={document.is_expired}
                                        >
                                            <Download size={16} />
                                            <span className="sr-only">Download</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate(`/documents/view/${document.id}`) }}
                                        >
                                            <Eye size={16} />
                                            <span className="sr-only">View</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate(`/documents/edit/${document.id}`) }}
                                        >
                                            <Edit size={16} />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && handleDelete(document) }}
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
        </div>
    );
};

export default ProductsTable;