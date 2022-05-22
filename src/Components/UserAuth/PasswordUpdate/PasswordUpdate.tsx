/* eslint-disable react/no-access-state-in-setstate */
import React, { useContext, useState } from 'react'
import classNames from 'classnames'
import Input from '../Input/Input'
import { FirebaseContext } from 'Components/Firebase'
import './PasswordUpdate.scss'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

interface ErrorsInterface {
  [key: string]: string | {}
  passwordError: string
  error: { message: string }
}

interface RequiredInputsInterface {
  password: string
}

const ERROR_DEFAULT_VALUES = {
  passwordError: '',
  error: { message: '' },
}

const PasswordUpdate: React.FC = () => {
  const { firebase } = useFrequentVariables()

  const [requiredInputs, setRequiredInputs] = useState<RequiredInputsInterface>({ password: '' })
  const [errors, setErrors] = useState<ErrorsInterface>(ERROR_DEFAULT_VALUES)
  const [submitClicked, setSubmitClicked] = useState(false)
  const [submitRequestLoading, setSubmitRequestLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordUpdated, setPasswordUpdated] = useState(false)

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setSubmitRequestLoading(true)
    event.preventDefault()
    const { password } = requiredInputs
    const errorsOnSubmit = { ...errors }

    if (!isFormValid(errorsOnSubmit, requiredInputs)) {
      for (const [key, value] of Object.entries(requiredInputs)) {
        if (value.length === 0) {
          errorsOnSubmit[`${key}Error`] = 'Required'
        }
      }
      setErrors(errorsOnSubmit)
      setSubmitClicked(true)
      setSubmitRequestLoading(false)
      return
    }

    firebase
      .passwordUpdate(password)
      .then(() => {
        setPasswordUpdated(true)
        setSubmitRequestLoading(false)
      })
      .catch((error: any) => {
        errorsOnSubmit.error = error
        setErrors(errorsOnSubmit)
        setSubmitRequestLoading(false)
      })
  }

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    const { value } = event.target
    const name = event.target.name === 'new-password' ? 'password' : event.target.name
    let errorsOnChange = { ...errors }

    if (errorsOnChange[`${name}OnBlur`] || submitClicked) {
      if (name === 'password') {
        errorsOnChange.passwordError = ''
      }
    }
    if (value === '') errorsOnChange = ERROR_DEFAULT_VALUES

    setErrors(errorsOnChange)
    setRequiredInputs({ ...requiredInputs, [name]: value })
  }

  const handleKeyDown = (e: any) => {
    e.which === 27 && resetInput(e.target.name)
  }

  const resetInput = (name: string) => {
    setRequiredInputs({ ...requiredInputs, [`${name}`]: '' })
    setErrors({ ...errors, [`${name}Error`]: '' })
  }

  const isFormValid = (errors: ErrorsInterface, requiredInputs: RequiredInputsInterface) => {
    let isValid = true

    for (const value of Object.values(requiredInputs)) {
      if (value.length === 0) {
        isValid = false
      }
    }

    for (const value of Object.values(errors)) {
      // @ts-ignore
      if (value.length > 0) {
        isValid = false
      }
    }

    return isValid
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <form className="auth__form auth_form--password-update" onSubmit={onSubmit}>
      {passwordUpdated ? (
        <div className="password-update-success">Password Updated</div>
      ) : (
        <>
          <Input
            classNameInput={classNames('auth__form-input auth__form-input--password', {
              'auth__form-input--error': errors.passwordError,
            })}
            classNameLabel="auth__form-label"
            name="new-password"
            autocomplete="new-password"
            value={requiredInputs.password}
            handleOnChange={handleOnChange}
            handleKeyDown={handleKeyDown}
            type={!showPassword ? 'password' : 'text'}
            placeholder="Update password"
            hidePasswordBtn
            toggleShowPassword={toggleShowPassword}
          />

          <div className="auth__form-error">{errors.passwordError}</div>

          {errors.error && <div className="auth__form-error">{errors.error.message}</div>}

          <button
            className={classNames('button button--auth__form', {
              'button--disabled': !isFormValid(errors, requiredInputs),
            })}
            type="submit"
          >
            {submitRequestLoading ? <span className="auth__form-loading" /> : 'Update Password'}
          </button>
        </>
      )}
    </form>
  )
}

export default PasswordUpdate
