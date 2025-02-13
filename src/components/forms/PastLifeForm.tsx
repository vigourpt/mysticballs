import React from 'react';
import { FormProps } from './types';

const PastLifeForm: React.FC<FormProps> = ({ 
  inputClassName, 
  labelClassName,
  values,
  onChange 
}) => (
  <>
    <div className="mb-4">
      <label className={labelClassName}>Current Life Concerns</label>
      <textarea
        value={values.concerns || ''}
        onChange={(e) => onChange('concerns', e.target.value)}
        className={`${inputClassName} h-32 resize-none`}
        placeholder="Describe your current situations or patterns you want to understand..."
        required
      />
    </div>
    <div className="mb-4">
      <label className={labelClassName}>Unexplained Feelings</label>
      <textarea
        value={values.feelings || ''}
        onChange={(e) => onChange('feelings', e.target.value)}
        className={`${inputClassName} h-32 resize-none`}
        placeholder="Describe any strong unexplained feelings, fears, or attractions..."
      />
    </div>
  </>
);

export default PastLifeForm;
