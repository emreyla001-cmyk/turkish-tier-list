import React from 'react';
import { tierGroup } from './tiers';

export default function TierBadge({ tier, large = false, showLabel = false }) {
  if (!tier) return null;
  const group = tierGroup(tier);

  return (
    <span
      className={`tier-badge ${group}${large ? ' lg' : ''}`}
      title={`Tier Seviyesi: ${tier}`}
    >
      <span className="tier-badge-inner">{tier}</span>
    </span>
  );
}
