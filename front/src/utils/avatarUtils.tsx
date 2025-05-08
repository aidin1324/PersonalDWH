import React from 'react';

export const AvatarFallback: React.FC<{ name: string, sizeClasses: string, textClasses?: string, containerClasses?: string }> =
  ({ name, sizeClasses, textClasses = 'text-xl', containerClasses = '' }) => {
  const validName = name || "?"; // Use "?" if name is not provided
  const firstLetter = validName.charAt(0).toUpperCase();
  let hash = 0;
  for (let i = 0; i < validName.length; i++) {
    hash = validName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500',
    'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
    'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
    'bg-pink-500', 'bg-rose-500'
  ];
  const color = colors[Math.abs(hash) % colors.length];
  return (
    <div className={`${sizeClasses} ${containerClasses} rounded-full flex items-center justify-center text-white font-semibold shadow-sm border border-gray-200 ${color}`}>
      <span className={textClasses}>{firstLetter}</span>
    </div>
  );
};
