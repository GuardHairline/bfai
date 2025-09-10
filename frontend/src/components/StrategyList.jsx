import React from 'react';
import { Button } from 'antd';

/**
 * StrategyList displays a list of measurement strategies as buttons.
 * The currently selected strategy is highlighted.  Clicking a
 * strategy calls onSelect with that strategy object.
 *
 * @param {Object[]} strategies - array of strategies (id, name, baselineIds).
 * @param {Function} onSelect - callback invoked with chosen strategy.
 * @param {Object|null} currentStrategy - the currently chosen strategy.
 */
const StrategyList = ({ strategies, onSelect, currentStrategy }) => {
  return (
    <div>
      {strategies.map((str) => (
        <Button
          key={str.id}
          type={currentStrategy?.id === str.id ? 'primary' : 'default'}
          onClick={() => onSelect(str)}
          style={{ marginRight: 8, marginBottom: 8 }}
        >
          {str.name}
        </Button>
      ))}
    </div>
  );
};

export default StrategyList;