/* eslint-disable react/no-access-state-in-setstate */
import React, { useState } from 'react'
import { validEmailRegex } from 'Utils'
import classNames from 'classnames'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import Input from '../Input/Input'

interface ErrorsInterface {
  emailError: string
  emailOnBlur: boolean
  error: { message: string }
  [key: string]: string | boolean | Record<string, unknown>
}

interface RequiredInputsInterface {
  email: string
}

const ERROR_DEFAULT_VALUES = {
  emailError: '',
  emailOnBlur: false,
  error: { message: '' },
}

const PasswordForget: React.FC = () => {
  const { firebase } = useFrequentVariables()

  const [requiredInputs, setRequiredInputs] = useState<RequiredInputsInterface>({ email: '' })
  const [errors, setErrors] = useState<ErrorsInterface>(ERROR_DEFAULT_VALUES)
  const [submitClicked, setSubmitClicked] = useState(false)
  const [submitRequestLoading, setSubmitRequestLoading] = useState(false)
  const [emailSentSuccess, setEmailSentSuccess] = useState(false)
  const [isEmailValid, setIsEmailValid] = useState(false)

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setSubmitRequestLoading(true)
    event.preventDefault()
    const { email } = requiredInputs
    const errorsOnSubmit = { ...errors }

    if (!isFormValid(errors, requiredInputs)) {
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
      .passwordReset(email)
      .then(() => {
        setRequiredInputs({ email: '' })
        setEmailSentSuccess(true)
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
    const { value, name } = event.target
    let errorsOnChange = { ...errors }

    if (errorsOnChange[`${name}OnBlur`] || submitClicked) {
      if (name === 'email') {
        errorsOnChange[`${name}Error`] = validEmailRegex.test(value) ? '' : 'Invalid email'
      }
    }

    setIsEmailValid(validEmailRegex.test(value))

    if (value === '') errorsOnChange = ERROR_DEFAULT_VALUES

    setErrors(errorsOnChange)
    setRequiredInputs({ ...requiredInputs, [name]: value })
  }

  const handleValidationOnblur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.preventDefault()

    const { value, name } = event.target
    const { email } = requiredInputs
    const errorsOnBlur = { ...errors }

    errorsOnBlur[`${name}OnBlur`] = true

    if (!submitClicked) {
      if (name === 'email') {
        errorsOnBlur[`${name}Error`] = validEmailRegex.test(email) ? '' : 'Invalid email'
      }

      if (value === '') {
        errorsOnBlur[`${name}Error`] = ''
        errorsOnBlur[`${name}OnBlur`] = false
      }
    }

    setErrors(errorsOnBlur)
  }

  const handleKeyDown = (e: any) => e.which === 27 && resetInput(e.target.name)

  const resetInput = (name: string) => {
    setRequiredInputs({ ...requiredInputs, [`${name}`]: '' })
    setErrors({ ...errors, [`${name}Error`]: '' })
  }

  const isFormValid = (errors: ErrorsInterface, requiredInputs: RequiredInputsInterface) => {
    let isValid = true

    isValid = !(requiredInputs.email.length === 0 || errors.emailError.length > 0)

    return isValid
  }

  return (
    <form className="auth__form" onSubmit={onSubmit}>
      <Input
        classNameInput={classNames('auth__form-input', {
          'auth__form-input--error': errors.emailError,
        })}
        classNameLabel="auth__form-label"
        name="email"
        value={requiredInputs.email}
        handleOnChange={handleOnChange}
        handleValidation={handleValidationOnblur}
        handleKeyDown={handleKeyDown}
        type="text"
        placeholder="Email Address"
        labelText="Email"
        withLabel
      />
      {emailSentSuccess && <div className="auth__form-password-message">Password reset link sent to your email</div>}
      {errors.emailError && <div className="auth__form-error">{errors.emailError}</div>}
      {errors.error && <div className="auth__form-error">{errors.error.message}</div>}

      <button
        className={classNames('button button--auth__form', {
          'button--disabled': !isFormValid(errors, requiredInputs) || !isEmailValid,
        })}
        type="submit"
      >
        {submitRequestLoading ? <span className="button-loader-circle" /> : 'Reset Password'}
      </button>
    </form>
  )
}

export default PasswordForget
