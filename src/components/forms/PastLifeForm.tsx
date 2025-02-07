import React from 'react';
import { FormProps } from './types';

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
        <option value="ancient">Ancient Civilizations (Before 500 CE)</option>
        <option value="medieval">Medieval Period (500-1500 CE)</option>
        <option value="renaissance">Renaissance (1300-1600 CE)</option>
        <option value="colonial">Colonial Era (1600-1800)</option>
        <option value="victorian">Victorian Era (1837-1901)</option>
        <option value="modern">Early Modern (1901-1950)</option>
      </select>
    </div>
    <div className="mb-4">
      <label className={labelClassName}>Recurring Dreams or Feelings</label>
      <textarea
        value={values.feelings || ''}
        onChange={(e) => onChange('feelings', e.target.value)}
        className={`${inputClassName} h-32 resize-none`}
        placeholder="Describe any recurring dreams, unexplained memories, or strong connections to specific places, cultures, or time periods..."
        required
      />
    </div>
  </>
);

export default PastLifeForm