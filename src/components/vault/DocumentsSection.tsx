
// 5. DocumentsSection Component
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DocumentsSection = () => {
    return (
        <div className="glass-card animate-slide-in p-6 text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">Access Your Secure Document Vault</h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                Store and manage sensitive documents like tax forms, ID cards, passports, and receipts securely in one place.
            </p>
            <Link to="/documents">
                <Button>
                    Go to Document Vault
                </Button>
            </Link>
        </div>
    );
};