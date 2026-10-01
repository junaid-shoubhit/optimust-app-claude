import React, { useCallback, useEffect, useState } from 'react';
import SelectField from '../../../../components/Forms/Select/Select';

const AttorneySelectCell = ({ rowId, initialValue, onChange, attorneysPayload }) => {
  const [selected, setSelected] = useState(initialValue ?? []);

  useEffect(() => {
    setSelected(initialValue ?? []);
  }, [initialValue]);

  const handleChange = useCallback(
    (next) => {
      const val = next || [];
      setSelected(val);
      if (typeof onChange === 'function') onChange(rowId, val);
    },
    [rowId, onChange],
  );

  return (
    <SelectField
      isMulti
      name={`assignAttorney-${rowId}`}
      placeholder="Select Attorneys"
      value={selected}
      onChange={handleChange}
      noErrorMessage
      payload={attorneysPayload}
    />
  );
};

export default React.memo(AttorneySelectCell);