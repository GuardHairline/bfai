import React from 'react';
import { Button } from 'antd';

/**
 * MeasurementEntry renders an entry card for starting a financial
 * estimation.  It shows a primary button which, when clicked,
 * triggers the onStart callback provided by the parent.  This is
 * displayed in a new conversation before any tasks have been chosen.
 *
 * @param {Function} onStart - invoked when the user clicks the start button.
 */
const MeasurementEntry = ({ onStart }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Button type="primary" onClick={onStart}>
        财务测算
      </Button>
    </div>
  );
};

export default MeasurementEntry;