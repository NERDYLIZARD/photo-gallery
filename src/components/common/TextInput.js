/**
 * Created on 26-Jun-17.
 */
'use strict';
import React from 'react';
import Proptypes from 'prop-types';

const TextInput = ({ type, name, value, onChange, label, placeholder, autoFocus, errors }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        autoFocus={autoFocus}
        className="form-control"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {errors && !!errors.length && errors.map((error, i) =>
        <div className="alert alert-danger" key={i}>{error}</div>)
      }
    </div>
  );
};

TextInput.propTypes = {
  autoFocus: Proptypes.bool,
  errors: Proptypes.array,
  label: Proptypes.string,
  name: Proptypes.string.isRequired,
  onChange: Proptypes.func.isRequired,
  placeholder: Proptypes.string,
  type: Proptypes.string.isRequired,
  value: Proptypes.string,
};

export default TextInput;
