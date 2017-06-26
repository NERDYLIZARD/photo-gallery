/**
 * Created on 26-Jun-17.
 */
'use strict';
import React from 'react';
import Proptypes from 'prop-types';
import { FormGroup, FormControl, ControlLabel, Alert } from 'react-bootstrap';

const TextInput = ({ type, name, value, onChange, label, placeholder, autoFocus, errors }) => {
  return (
    <FormGroup
      controlId={name}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl
        autoFocus={autoFocus}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {errors && !!errors.length && errors.map((error, i) =>
        <Alert bsStyle="danger" key={i}>{error}</Alert>)
      }
    </FormGroup>
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
