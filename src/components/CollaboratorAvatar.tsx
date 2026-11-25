import { useState } from 'react';
import { getInitials } from '../utils/talentLogic';

interface CollaboratorAvatarProps {
  fullName: string;
  avatarUrl?: string;
  sizeClass?: string;
  textSizeClass?: string;
}

const AVATAR_TONES = [
  'bg-[#0F294A] text-white',
  'bg-[#30476A] text-white',
  'bg-[#1E3A8A] text-white',
  'bg-[#004395] text-white',
];

function pickTone(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

export function CollaboratorAvatar({
  fullName,
  avatarUrl,
  sizeClass = 'h-12 w-12 md:h-14 md:w-14',
  textSizeClass = 'text-sm md:text-base',
}: CollaboratorAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (avatarUrl && !failed) {
    return (
      <img
        src={avatarUrl}
        alt={`Foto de ${fullName}`}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${sizeClass} rounded-full object-cover border border-[#E2E8F0] shrink-0 bg-[#EFF4FF]`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${sizeClass} ${pickTone(fullName)} rounded-full flex items-center justify-center font-display font-semibold tracking-tight shrink-0 border border-[#0F294A]/10 ${textSizeClass}`}
    >
      {getInitials(fullName)}
    </div>
  );
}
