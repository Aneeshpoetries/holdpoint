import React from 'react';

export const PersonaAvatar: React.FC<{ id: string; name: string; className?: string }> = ({ id, name, className = '' }) => (
  <span className={`cr-avatar ${className}`} data-avatar={id}>
    <img src={`/avatars/${id}.png`} alt="" loading={className.includes('is-large') ? 'eager' : 'lazy'} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
    <span aria-hidden="true">{name.split(' ').map((part) => part[0]).join('')}</span>
  </span>
);
