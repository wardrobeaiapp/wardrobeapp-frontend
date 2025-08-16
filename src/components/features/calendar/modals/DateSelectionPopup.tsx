import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCalendarAlt } from 'react-icons/fa';
import { Modal, ModalAction } from '../../../common/Modal';
import SimpleDatePicker from '../SimpleDatePicker';

interface DateSelectionPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  currentDate: Date;
}

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

const DateSelectionPopup: React.FC<DateSelectionPopupProps> = ({
  isVisible,
  onClose,
  onSelectDate,
  currentDate
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleConfirm = () => {
    if (selectedDate) {
      onSelectDate(selectedDate);
      onClose();
    }
  };

  const actions: ModalAction[] = [
    { label: 'Cancel', onClick: onClose, variant: 'secondary' },
    { 
      label: 'Copy', 
      onClick: handleConfirm, 
      variant: 'primary',
      disabled: !selectedDate
    }
  ];

  return (
    <Modal
      isOpen={isVisible}
      onClose={onClose}
      title="Copy from Date"
      actions={actions}
      size="md"
    >
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
    </Modal>
  );
};

export default DateSelectionPopup;
