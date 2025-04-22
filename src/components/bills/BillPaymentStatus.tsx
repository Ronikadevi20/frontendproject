
interface BillPaymentStatusProps {
  isPaid: boolean;
  onTogglePaid: (isPaid: boolean) => void;
}

const BillPaymentStatus = ({ isPaid, onTogglePaid }: BillPaymentStatusProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Payment Status
      </label>
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => onTogglePaid(false)}
          className={`px-4 py-2 rounded-lg flex-1 ${!isPaid
            ? 'bg-red-100 border-2 border-red-300 text-red-700'
            : 'bg-gray-100 border border-gray-200 text-gray-700'}`}
        >
          Unpaid
        </button>
        <button
          type="button"
          onClick={() => onTogglePaid(true)}
          className={`px-4 py-2 rounded-lg flex-1 ${isPaid
            ? 'bg-green-100 border-2 border-green-300 text-green-700'
            : 'bg-gray-100 border border-gray-200 text-gray-700'}`}
        >
          Paid
        </button>
      </div>
    </div>
  );
};

export default BillPaymentStatus;
