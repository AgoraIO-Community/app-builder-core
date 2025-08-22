import React from 'react';
import ToolbarItem from '../../atoms/ToolbarItem';
import V2VHealthBadge from '../../subComponents/v2v/V2VHealthBadge';

export const V2VHealthToolbarItem = () => {
  return (
    <ToolbarItem>
      <V2VHealthBadge />
    </ToolbarItem>
  );
};

export default V2VHealthToolbarItem;