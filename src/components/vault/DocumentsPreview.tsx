// 6. DocumentsPreview Component
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DocumentsPreview = () => {
    return (
        <div className="glass-card animate-slide-in p-6">
            <h3 className="font-medium flex items-center mb-4">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Document Vault
            </h3>

            <div className="py-6 text-center border-2 border-dashed rounded-lg">
                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Access your secure documents</h3>
                <p className="text-gray-500 mb-4">Store and manage important files and documents</p>
                <Link to="/documents">
                    <Button variant="outline">
                        View Documents
                    </Button>
                </Link>
            </div>
        </div>
    );
};