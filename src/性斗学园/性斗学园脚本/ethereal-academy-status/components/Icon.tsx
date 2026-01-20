import React from 'react';
import {
  User,
  Map,
  Backpack,
  Swords,
  HeartHandshake,
  ScrollText,
  Settings,
  Sparkles,
  Zap,
  Shield,
  Heart,
  Activity,
  Clock,
  MapPin,
  Coins,
  Menu,
  X,
  Star,
  Ghost,
  Check,
} from 'lucide-react';

export const Icons = {
  User,
  Map,
  Backpack,
  Swords,
  Relationship: HeartHandshake,
  Quest: ScrollText,
  Settings,
  Charm: Sparkles,
  Stats: Activity,
  Zap,
  Shield,
  Heart,
  Clock,
  Location: MapPin,
  Money: Coins,
  Menu,
  Close: X,
  Star,
  Ghost,
  Check,
};

interface IconProps {
  name: keyof typeof Icons;
  size?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 20, className }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) {
    console.error(`Icon "${name}" not found`);
    return null;
  }
  return <IconComponent size={size} className={className} />;
};

export default Icon;
