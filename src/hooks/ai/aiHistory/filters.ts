import { WishlistStatus } from '../../../types';
import { AIHistoryItem } from '../../../types/ai';
import { ActivityType, CheckStatus } from './types';

export const filterHistoryItems = (
  historyItems: AIHistoryItem[],
  activityFilter: ActivityType,
  checkStatusFilter: CheckStatus,
  userActionFilter: string
) => {
  return historyItems.filter(item => {
    if (activityFilter !== 'all' && item.type !== activityFilter) {
      return false;
    }

    if (item.type === 'check' && checkStatusFilter !== 'all') {
      if (checkStatusFilter === 'approved' && item.status !== WishlistStatus.APPROVED) {
        return false;
      }
      if (checkStatusFilter === 'potential_issue' && item.status !== WishlistStatus.POTENTIAL_ISSUE) {
        return false;
      }
      if (checkStatusFilter === 'not_reviewed' && item.status !== WishlistStatus.NOT_REVIEWED) {
        return false;
      }
      if (checkStatusFilter === 'not_recommended' && item.status !== WishlistStatus.NOT_RECOMMENDED) {
        return false;
      }
    }

    if (userActionFilter !== 'all' && item.userActionStatus !== userActionFilter) {
      return false;
    }

    return true;
  });
};
