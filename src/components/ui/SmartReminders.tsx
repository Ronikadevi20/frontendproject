import { useState } from 'react';
import { CheckCircle, AlertTriangle, Key, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SmartRemindersProps {
    dueApplications: any[];
    expiringDocuments: any[];
    weakPasswords: any[];
    upcomingBills: any[];
    dismissedFollowUps: string[];
    onDismissFollowUp: (id: string) => void;
}

const SmartReminders: React.FC<SmartRemindersProps> = ({
    dueApplications,
    expiringDocuments,
    weakPasswords,
    upcomingBills,
    dismissedFollowUps,
    onDismissFollowUp
}) => {
    const [dismissed, setDismissed] = useState<string[]>([]);

    const handleDismiss = (id: string) => {
        setDismissed(prev => [...prev, id]);
        onDismissFollowUp(id);
    };

    const getPriority = (daysLeft: number | null) => {
        if (daysLeft === null) return '🟡 Medium';
        if (daysLeft <= 1) return '🔴 High';
        if (daysLeft <= 3) return '🟡 Medium';
        return '🟢 Low';
    };

    const reminders = [
        ...dueApplications.map(app => {
            const deadline = new Date(app.deadline_date);
            const diff = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return {
                id: `app-${app.id}`,
                priority: getPriority(diff),
                message: `Your application for "${app.job_title}" (${app.company}) is due in ${diff} day(s).`,
                action: 'View Application',
                url: `/applications/view/${app.id}`
            };
        }),
        ...expiringDocuments.map(doc => {
            const expiry = new Date(doc.expiry_date);
            const diff = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return {
                id: `doc-${doc.id}`,
                priority: getPriority(diff),
                message: `Document “${doc.title}” expires in ${diff} day(s).`,
                action: 'Review',
                url: `/documents/view/${doc.id}`
            };
        }),
        ...weakPasswords.map(pwd => ({
            id: `pwd-${pwd.id}`,
            priority: '🟡 Medium',
            message: `You have a weak password (${pwd.name}).`,
            action: 'Update Password',
            url: `/passwords/view/${pwd.id}`
        })),
        ...upcomingBills.map(bill => {
            const due = new Date(bill.due_date);
            const diff = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return {
                id: `bill-${bill.id}`,
                priority: diff <= 1 ? '🔴 High' : diff <= 3 ? '🟡 Medium' : '🟢 Low',
                message: `Bill “${bill.name}” is due in ${diff} day(s).`,
                action: 'View Bill',
                url: `/bills/view/${bill.id}`
            };
        }),
    ];

    const priorityValue = (p: string) =>
        p.includes('🔴') ? 1 : p.includes('🟡') ? 2 : 3;

    const sorted = reminders
        .filter(rem => !dismissed.includes(rem.id))
        .sort((a, b) => priorityValue(a.priority) - priorityValue(b.priority));


    return (
        <section className="glass-card p-6 animate-fade-in mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                Smart Reminders
            </h2>
            <div className="space-y-4">
                {sorted.map(rem => (

                    <div
                        key={rem.id}
                        className="flex justify-between items-center bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all"
                    >
                        <div>
                            <div className="flex items-center text-sm font-medium mb-1">
                                <span className={`w-2.5 h-2.5 rounded-full mr-2 ${rem.priority.includes('🔴') ? 'bg-red-500' :
                                    rem.priority.includes('🟡') ? 'bg-yellow-400' :
                                        'bg-green-500'
                                    }`} />
                                {rem.priority.replace('🔴 ', '').replace('🟡 ', '').replace('🟢 ', '')} Priority
                            </div>

                            <p className="text-sm text-gray-700">{rem.message}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {rem.url && (
                                <Button size="sm" variant="outline" onClick={() => location.href = rem.url}>
                                    {rem.action}
                                </Button>
                            )}
                            {rem.followUpId && (
                                <label className="flex items-center cursor-pointer text-sm">
                                    <input
                                        type="checkbox"
                                        className="mr-2 accent-green-600"
                                        onChange={() => handleDismiss(rem.followUpId)}
                                    />
                                    Done
                                </label>

                            )}
                        </div>
                    </div>
                ))}

                {sorted.length === 0 && (

                    <p className="text-gray-500 text-sm text-center">🎉 No pending reminders!</p>
                )}
            </div>
        </section>
    );
};

export default SmartReminders;
