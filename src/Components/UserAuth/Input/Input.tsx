import React from "react"

type Props = {
  classNameInput: string
  classNameLabel?: string
  name: string
  value: string
  type: string
  placeholder?: string
  labelText?: string
  hidePasswordBtn?: boolean
  withLabel?: boolean
  autocomplete?: string
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleValidation?: (event: React.FocusEvent<HTMLInputElement>) => void
  handleKeyDown: (e: any) => void
  toggleShowPassword?: () => void
}

const Input: React.FC<Props> = ({
  classNameInput,
  classNameLabel,
  name,
  autocomplete,
  value,
  type,
  placeholder,
  labelText,
  withLabel = false,
  hidePasswordBtn,
  handleOnChange,
  handleValidation,
  handleKeyDown,
  toggleShowPassword
}) => {
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
              onClick={() => toggleShowPassword && toggleShowPassword()}
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

export default Input
