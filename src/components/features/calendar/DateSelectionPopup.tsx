import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCalendarAlt } from 'react-icons/fa';
import SimpleDatePicker from './SimpleDatePicker';
import { CalendarButton } from '../../../pages/CalendarPage.styles';

interface DateSelectionPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  currentDate: Date;
}

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PopupTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const DatePickerContainer = styled.div`
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DatePickerLabel = styled.label`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  font-weight: bold;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const DateSelectionPopup: React.FC<DateSelectionPopupProps> = ({
  isVisible,
  onClose,
  onSelectDate,
  currentDate
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  if (!isVisible) {
    return null;
  }

  const handleConfirm = () => {
    if (selectedDate) {
      onSelectDate(selectedDate);
      onClose();
    }
  };

  return (
    <PopupOverlay>
      <PopupContent>
        <PopupHeader>
          <PopupTitle>Copy from Date</PopupTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </PopupHeader>
        
        <p>Select a date to copy outfits and items from:</p>
        
        <DatePickerContainer>
          <DatePickerLabel>
            <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
            Source Date:
          </DatePickerLabel>
          <SimpleDatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            inline
            minDate={new Date(currentDate.getFullYear() - 1, 0, 1)}
            maxDate={new Date(currentDate.getFullYear() + 1, 11, 31)}
          />
        </DatePickerContainer>
        
        <ButtonContainer>
          <CalendarButton variant="secondary" onClick={onClose}>Cancel</CalendarButton>
          <CalendarButton 
            variant="primary"
            onClick={handleConfirm} 
            disabled={!selectedDate}
          >
            Copy
          </CalendarButton>
        </ButtonContainer>
      </PopupContent>
    </PopupOverlay>
  );
};

export default DateSelectionPopup;
