
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  label: string;
  date: string | undefined;
  onDateChange: (date: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

const BillDatePicker = ({
  label,
  date,
  onDateChange,
  required = false,
  error,
  placeholder = "Pick a date"
}: DatePickerProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && '*'}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {date ? format(new Date(date), "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <CalendarComponent
            mode="single"
            selected={date ? new Date(date) : undefined}
            onSelect={(selectedDate) => selectedDate && onDateChange(format(selectedDate, 'yyyy-MM-dd'))}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default BillDatePicker;
