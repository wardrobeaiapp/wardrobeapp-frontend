import React from 'react';
import {
  ContentContainer,
  HistoryItem,
  HistoryDate,
  HistoryTitle,
  HistoryDescription,
  NoHistoryMessage
} from '../../pages/AIAssistantPage.styles';

interface HistoryItemType {
  id: string;
  date: Date;
  type: string;
  title: string;
  description: string;
}

interface AIHistoryProps {
  historyItems: HistoryItemType[];
}

const AIHistory: React.FC<AIHistoryProps> = ({ historyItems }) => {
  return (
    <ContentContainer>
      {historyItems.length > 0 ? (
        historyItems.map(item => (
          <HistoryItem key={item.id}>
            <HistoryDate>{item.date.toLocaleDateString()}</HistoryDate>
            <HistoryTitle>{item.title}</HistoryTitle>
            <HistoryDescription>{item.description}</HistoryDescription>
          </HistoryItem>
        ))
      ) : (
        <NoHistoryMessage>No AI check history yet. Try using some of the AI features!</NoHistoryMessage>
      )}
    </ContentContainer>
  );
};

export default AIHistory;
