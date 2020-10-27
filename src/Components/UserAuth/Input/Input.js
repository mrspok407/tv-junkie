import React, { Component } from "react"

export default class Input extends Component {
  render() {
    const {
      classNameInput,
      classNameLabel,
      name,
      autocomplete,
      value,
      handleOnChange,
      handleValidation,
      handleKeyDown,
      type,
      placeholder,
      labelText,
      withLabel = false,
      hidePasswordBtn,
      toggleShowPassword
    } = this.props

    return (
      <>
        {withLabel && (
          <label className={classNameLabel} htmlFor={name}>
            {labelText}
            {hidePasswordBtn && (
              <span
                className={
                  type === "password" ? "auth__form-label-show-password" : "auth__form-label-hide-password"
                }
                onClick={() => toggleShowPassword()}
              ></span>
            )}
          </label>
        )}
        <input
          className={classNameInput}
          autoComplete={autocomplete}
          name={name}
          value={value}
          onChange={handleOnChange}
          onBlur={handleValidation}
          onKeyDown={handleKeyDown}
          type={type}
          placeholder={placeholder}
        />
      </>
    )
  }
}
