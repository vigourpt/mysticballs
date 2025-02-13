import React from 'react';
import { FormProps } from './types';

const AuraForm: React.FC<FormProps> = ({ 
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
      <label className={labelClassName}>Current Feelings</label>
      <textarea
        value={values.feelings || ''}
        onChange={(e) => onChange('feelings', e.target.value)}
        className={`${inputClassName} h-32 resize-none`}
        placeholder="Describe your current emotional and physical state..."
        required
      />
    </div>
  </>
);

export default AuraForm;
