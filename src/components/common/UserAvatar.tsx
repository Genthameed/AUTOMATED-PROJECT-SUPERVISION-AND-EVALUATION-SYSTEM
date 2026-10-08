import React from 'react';
import { normalizeIconicAvatar } from '../../utils/iconicAvatars';

interface UserAvatarProps {
  avatar?: string | null;
  role?: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  role = 'student',
  name = 'User',
  className = '',
  size = 'md'
}) => {
  const iconicUrl = normalizeIconicAvatar(avatar, role);
  
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-11 w-11',
    xl: 'h-14 w-14'
  }[size] || 'h-8 w-8';

  return (
    <img
      src={iconicUrl}
      alt={`${name} (${role})`}
      className={`${sizeClasses} rounded-full object-contain shrink-0 bg-stone-100/50 shadow-2xs ${className}`}
      loading="eager"
    />
  );
};
