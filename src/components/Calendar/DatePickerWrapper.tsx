import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerWrapperProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  inline?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const DatePickerWrapper: React.FC<DatePickerWrapperProps> = ({
  selected,
  onChange,
  inline = false,
  minDate,
  maxDate
}) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      inline={inline}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
};

export default DatePickerWrapper;
