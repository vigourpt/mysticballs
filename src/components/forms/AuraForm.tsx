import React from 'react';
import { FormProps } from './types';

const AuraForm: React.FC<FormProps> = ({ 
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
      <label className={labelClassName}>Personality Description</label>
      <textarea
        value={values.personality || ''}
        onChange={(e) => onChange('personality', e.target.value)}
        className={`${inputClassName} h-32 resize-none`}
        placeholder="Describe your personality, emotions, and current energy levels..."
        required
      />
    </div>
    <div className="mb-4">
      <label className={labelClassName}>Current Emotional State</label>
      <select
        value={values.emotionalState || ''}
        onChange={(e) => onChange('emotionalState', e.target.value)}
        className={inputClassName}
        required
      >
        <option value="">Select your emotional state</option>
        <option value="peaceful">Peaceful & Calm</option>
        <option value="energetic">Energetic & Excited</option>
        <option value="balanced">Balanced & Centered</option>
        <option value="stressed">Stressed & Overwhelmed</option>
        <option value="creative">Creative & Inspired</option>
        <option value="spiritual">Spiritual & Connected</option>
      </select>
    </div>
  </>
);

export default AuraForm