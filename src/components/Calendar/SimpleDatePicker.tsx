import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface SimpleDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  inline?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const DateInput = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
  max-width: 300px;
  margin-bottom: 10px;
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const CalendarContainer = styled.div`
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 320px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const MonthYearDisplay = styled.div`
  font-weight: bold;
  font-size: 18px;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #4a90e2;
  padding: 5px 10px;
  &:hover {
    background-color: #f0f0f0;
    border-radius: 4px;
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-top: 10px;
`;

const DayCell = styled.div<{ isSelected?: boolean; isCurrentMonth?: boolean; isDisabled?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 35px;
  border-radius: 50%;
  cursor: ${props => (props.isDisabled ? 'not-allowed' : 'pointer')};
  background-color: ${props => (props.isSelected ? '#4a90e2' : 'transparent')};
  color: ${props => {
    if (props.isDisabled) return '#ccc';
    if (props.isSelected) return 'white';
    if (!props.isCurrentMonth) return '#999';
    return 'inherit';
  }};
  opacity: ${props => (!props.isCurrentMonth ? 0.5 : 1)};
  font-weight: ${props => (props.isSelected ? 'bold' : 'normal')};
  &:hover {
    background-color: ${props => (props.isSelected ? '#4a90e2' : '#f0f0f0')};
  }
`;

const WeekdayHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 5px;
  text-align: center;
  font-weight: bold;
  color: #666;
`;

const WeekdayCell = styled.div`
  padding: 5px 0;
  font-size: 14px;
`;

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({
  selected,
  onChange,
  inline = false,
  minDate,
  maxDate
}) => {
  // State for the current month being displayed
  const [currentMonth, setCurrentMonth] = useState<Date>(selected || new Date());
  
  // Update currentMonth when selected changes
  useEffect(() => {
    if (selected) {
      setCurrentMonth(new Date(selected));
    }
  }, [selected]);

  // Format date to YYYY-MM-DD for the input
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date change from input
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const newDate = new Date(value);
      onChange(newDate);
      setCurrentMonth(newDate);
    } else {
      onChange(null);
    }
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a date is the same as the selected date
  const isSameDate = (date1: Date, date2: Date | null) => {
    if (!date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Check if a date is disabled (outside min/max range)
  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Render calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Get days from previous month to fill the first row
    const daysFromPrevMonth = firstDayOfMonth;
    const prevMonthDays = [];
    
    if (daysFromPrevMonth > 0) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
      
      for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
        const date = new Date(prevMonthYear, prevMonth, i);
        prevMonthDays.push({
          date,
          day: i,
          isCurrentMonth: false,
          isDisabled: isDateDisabled(date)
        });
      }
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      currentMonthDays.push({
        date,
        day: i,
        isCurrentMonth: true,
        isDisabled: isDateDisabled(date)
      });
    }
    
    // Next month days to fill the last row
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
    const daysNeeded = Math.ceil(totalDaysDisplayed / 7) * 7;
    const nextMonthDays = [];
    
    if (totalDaysDisplayed < daysNeeded) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextMonthYear = month === 11 ? year + 1 : year;
      
      for (let i = 1; i <= daysNeeded - totalDaysDisplayed; i++) {
        const date = new Date(nextMonthYear, nextMonth, i);
        nextMonthDays.push({
          date,
          day: i,
          isCurrentMonth: false,
          isDisabled: isDateDisabled(date)
        });
      }
    }
    
    // Combine all days
    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    
    // Weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <>
        <CalendarHeader>
          <NavButton onClick={prevMonth}>&lt;</NavButton>
          <MonthYearDisplay>
            {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
          </MonthYearDisplay>
          <NavButton onClick={nextMonth}>&gt;</NavButton>
        </CalendarHeader>
        
        <WeekdayHeader>
          {weekdays.map(day => (
            <WeekdayCell key={day}>{day}</WeekdayCell>
          ))}
        </WeekdayHeader>
        
        <DaysGrid>
          {allDays.map((day, index) => (
            <DayCell
              key={index}
              isSelected={selected ? isSameDate(day.date, selected) : false}
              isCurrentMonth={day.isCurrentMonth}
              isDisabled={day.isDisabled}
              onClick={() => {
                if (!day.isDisabled) {
                  onChange(day.date);
                }
              }}
            >
              {day.day}
            </DayCell>
          ))}
        </DaysGrid>
      </>
    );
  };

  return (
    <DatePickerContainer>
      {!inline && (
        <DateInput
          type="date"
          value={formatDate(selected)}
          onChange={handleDateChange}
          min={minDate ? formatDate(minDate) : undefined}
          max={maxDate ? formatDate(maxDate) : undefined}
        />
      )}
      {inline && (
        <CalendarContainer>
          {renderCalendar()}
        </CalendarContainer>
      )}
    </DatePickerContainer>
  );
};

export default SimpleDatePicker;
