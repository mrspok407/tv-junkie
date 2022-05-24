/* eslint-disable react/no-access-state-in-setstate */
import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { validEmailRegex } from 'Utils'
import * as ROUTES from 'Utils/Constants/routes'
import classNames from 'classnames'
import { AppContext } from 'Components/AppContext/AppContextHOC'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import Input from '../Input/Input'
import SignInWithGoogleForm from './SignInWithGoogle'

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = 'watchingShowsLocalS'
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = 'watchLaterMoviesLocalS'

type Props = {
  closeNavMobile: () => void
  togglePasswordForget: () => void
}

interface ErrorsInterface {
  emailError: string
  emailOnBlur: boolean
  passwordError: string
  error: { message: string }
  [key: string]: string | boolean | Record<string, unknown>
}

interface RequiredInputsInterface {
  email: string
  password: string
}

const ERROR_DEFAULT_VALUES = {
  emailError: '',
  emailOnBlur: false,
  passwordError: '',
  error: { message: '' },
}

const SignInFormBase: React.FC<Props> = ({ closeNavMobile, togglePasswordForget }) => {
  const context = useContext(AppContext)
  const { firebase } = useFrequentVariables()

  const [requiredInputs, setRequiredInputs] = useState<RequiredInputsInterface>({ email: '', password: '' })
  const [errors, setErrors] = useState<ErrorsInterface>(ERROR_DEFAULT_VALUES)
  const [submitClicked, setSubmitClicked] = useState(false)
  const [submitRequestLoading, setSubmitRequestLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isEmailValid, setIsEmailValid] = useState(false)

  const history = useHistory()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setSubmitRequestLoading(true)
    event.preventDefault()
    const { email, password } = requiredInputs
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
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        localStorage.removeItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)
        localStorage.removeItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)

        context.userContentLocalStorage.clearContentState()
        if (closeNavMobile) closeNavMobile()

        setSubmitRequestLoading(false)
        history.push(ROUTES.HOME_PAGE)
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
    const name = event.target.name === 'current-password' ? 'password' : event.target.name
    let errorsOnChange = { ...errors }

    if (errorsOnChange[`${name}OnBlur`] || submitClicked) {
      if (name === 'email') {
        errorsOnChange[`${name}Error`] = validEmailRegex.test(value) ? '' : 'Invalid email'
      }
      if (name === 'password') {
        errorsOnChange.passwordError = ''
      }
    }
    if (name === 'email') setIsEmailValid(validEmailRegex.test(value))
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

      if (name === 'password') {
        errorsOnBlur.passwordError = ''
      }

      if (value === '') {
        errorsOnBlur[`${name}Error`] = ''
        errorsOnBlur[`${name}OnBlur`] = false
      }
    }

    setErrors(errorsOnBlur)
  }

  const handleKeyDown = (e: any) => {
    if (e.which === 27) resetInput(e.target.name)
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
      <div className="auth__form-error">{errors.emailError}</div>

      <Input
        classNameInput={classNames('auth__form-input auth__form-input--password', {
          'auth__form-input--error': errors.passwordError,
        })}
        classNameLabel="auth__form-label"
        name="current-password"
        autocomplete="current-password"
        value={requiredInputs.password}
        handleOnChange={handleOnChange}
        handleKeyDown={handleKeyDown}
        type={!showPassword ? 'password' : 'text'}
        placeholder="Password"
        labelText="Password"
        hidePasswordBtn
        toggleShowPassword={toggleShowPassword}
        withLabel
      />

      <div className="auth__form-error">{errors.passwordError}</div>

      {errors.error && <div className="auth__form-error">{errors.error.message}</div>}

      <span onClick={togglePasswordForget} className="auth__form-password-link">
        Forget password?
      </span>

      <button
        className={classNames('button button--auth__form', {
          'button--disabled': !isFormValid(errors, requiredInputs) || !isEmailValid,
        })}
        type="submit"
      >
        {submitRequestLoading ? <span className="auth__form-loading" /> : 'Sign In'}
      </button>
      <SignInWithGoogleForm />
    </form>
  )
}

export default SignInFormBase
