// 7. PasswordListItem Component
import { Eye, EyeOff, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PasswordListItem = ({
    password,
    isVisible,
    toggleVisibility,
    copyToClipboard,
    navigate
}) => {
    return (
        <div className="px-6 py-3 hover:bg-gray-50">
            <div className="flex justify-between items-start">
                <div>
                    <div className="font-medium">{password.website}</div>
                    <div className="text-sm text-gray-500">{password.username}</div>
                </div>
                <div className="flex space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleVisibility(password.id)}
                        aria-label="Toggle visibility"
                    >
                        {isVisible ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => navigate(`/passwords/edit/${password.id}`)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {isVisible && (
                <div className="mt-2 flex items-center">
                    <div className="font-mono text-sm bg-gray-50 py-1 px-2 rounded border">{password.password}</div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-xs h-7"
                        onClick={() => copyToClipboard(password.password)}
                    >
                        Copy
                    </Button>
                </div>
            )}
            {password.url && (
                <div className="mt-1 text-xs">
                    <a
                        href={password.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        {password.url}
                    </a>
                </div>
            )}
        </div>
    );
};
export default PasswordListItem;