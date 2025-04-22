import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

const DangerZone = () => {
    const handleAccountDeletion = () => {
        if (window.confirm('Permanently delete account?')) {
            // Account deletion logic here
        }
    };

    return (
        <section className="glass-card p-6 border-red-200 bg-red-50">
            <h3 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h3>
            <Button variant="destructive" onClick={handleAccountDeletion}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account Permanently
            </Button>
            <p className="text-sm text-red-600">Warning: This will permanently erase all your data.</p>
        </section>
    );
};

export default DangerZone;