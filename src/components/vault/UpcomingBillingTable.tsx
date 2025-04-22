import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO, isValid } from 'date-fns';

const UpcomingBillsSection = ({ upcomingBills, navigate, setSearchQuery, setSelectedCategory }) => {
    if (!upcomingBills || upcomingBills.length === 0) return null;

    return (
        <div className="glass-card p-4 mb-6 border-l-4 border-yellow-400">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center">
                <AlertCircle className="text-yellow-500 w-5 h-5 mr-2" />
                Upcoming Bills
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <tbody>
                        {upcomingBills.slice(0, 3).map((bill) => {
                            // Safely parse the date
                            const dueDate = bill.dueDate ? parseISO(bill.dueDate) : null;
                            const formattedDate = dueDate && isValid(dueDate)
                                ? format(dueDate, 'MMM d, yyyy')
                                : dueDate;

                            // Safely format the amount
                            const amount = typeof bill.amount === 'number'
                                ? `$${bill.amount.toFixed(2)}`
                                : bill.amount
                                    ? `$${Number(bill.amount).toFixed(2)}`
                                    : '$0.00';

                            return (
                                <tr key={bill.id} className="border border-red-100 rounded-md align-top ">
                                    <td className="py-4 pl-4 pr-4">
                                        <div className="font-medium">{bill.name}</div>
                                        <div className="text-xs text-gray-500">Due {bill.due_date}</div>
                                    </td>
                                    <td className=" text-right py-4">
                                        <div className="font-medium text-gray-900">{amount}</div>
                                    </td>
                                    <td className="pl-4 text-right pr-6">
                                        <button
                                            className="text-xs py-4"
                                            onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate(`/bills/edit/${bill.id}`) }}
                                        >
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {upcomingBills.length > 3 && (
                    <div className="mt-2 text-right">
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('bills');
                            }}
                        >
                            View all {upcomingBills.length} upcoming bills
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingBillsSection;