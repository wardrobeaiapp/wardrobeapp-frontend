import React, { useEffect, useState } from 'react';
import useCapsuleItems from '../../hooks/useCapsuleItems';

interface CapsuleItemCounterProps {
  capsuleId: string;
  fallbackCount?: number;
}

/**
 * Component that displays the number of items in a capsule
 * Uses the useCapsuleItems hook to get the count from the capsule_items join table
 * Falls back to the provided fallbackCount if no items are found in the join table
 */
const CapsuleItemCounter: React.FC<CapsuleItemCounterProps> = ({ 
  capsuleId, 
  fallbackCount = 0 
}) => {
  const { itemIds, loading } = useCapsuleItems(capsuleId);
  const [count, setCount] = useState<number>(fallbackCount);

  useEffect(() => {
    // If we have items from the join table, use that count
    if (itemIds.length > 0) {
      setCount(itemIds.length);
    } else if (!loading && fallbackCount > 0) {
      // If no items in join table but we have a fallback, use that
      setCount(fallbackCount);
    }
  }, [itemIds, loading, fallbackCount]);

  return (
    <>{count} items</>
  );
};

export default CapsuleItemCounter;
