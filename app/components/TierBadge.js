import { tierGroup } from './tiers';

export default function TierBadge({ tier, large = false }) {
  if (!tier) return null;
  return <span className={`tier-badge ${tierGroup(tier)}${large ? ' lg' : ''}`}>{tier}</span>;
}
