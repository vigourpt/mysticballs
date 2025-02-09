import React from 'react';
import { FormProps } from './types';

const TIME_PERIODS = [
  { value: 'ancient', label: 'Ancient Civilizations (Before 500 CE)' },
  { value: 'medieval', label: 'Medieval Period (500-1500 CE)' },
  { value: 'renaissance', label: 'Renaissance (1300-1600 CE)' },
  { value: 'colonial', label: 'Colonial Era (1600-1800)' },
  { value: 'victorian', label: 'Victorian Era (1837-1901)' },
  { value: 'modern', label: 'Early Modern (1901-1950)' }
];

const PastLifeForm: React.FC<FormProps> = ({ 
  isDarkMode, 
  inputClassName, 
  labelClassName,
  values,
  onChange 
}) => (
  <>
    <div className="mb-4">
      <label className={labelClassName}>Your Name</label>
      <input
        type="text"
        value={values.name || ''}
        onChange={(e) => onChange('name', e.target.value)}
        className={inputClassName}
        placeholder="Enter your name"
        required
      />
    </div>
    <div className="mb-4">
      <label className={labelClassName}>Time Period Attraction</label>
      <select
        value={values.timePeriod || ''}
        onChange={(e) => onChange('timePeriod', e.target.value)}
        className={inputClassName}
        required
      >
        <option value="">Select a time period you feel drawn to</option>
        {TIME_PERIODS.map(period => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  </>
);

export default PastLifeForm;