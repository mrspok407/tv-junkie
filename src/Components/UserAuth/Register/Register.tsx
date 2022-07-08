/* eslint-disable react/no-access-state-in-setstate */
import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { validEmailRegex } from 'Utils'
import * as ROLES from 'Utils/Constants/roles'
import * as ROUTES from 'Utils/Constants/routes'
import classNames from 'classnames'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import {
  LocalStorageHandlersContext,
  LocalStorageValueContext,
} from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { ErrorInterface, ErrorsHandlerContext } from 'Components/AppContext/Contexts/ErrorsContext'
import SignInWithGoogleForm from '../SignIn/SignInWithGoogle'
import { AuthUserFirebaseInterface } from '../Session/Authentication/@Types'
import Input from '../Input/Input'
import getShowEpisodesTMDB from 'Components/UserContent/TmdbAPIHelpers/getShowEpisodesFromAPI'
import { formatShowEpisodesForUserDatabase } from 'Utils/FormatTMDBAPIData'

type Props = {
  closeNavMobile: () => void
}

interface FormErrorsInt {
  loginError: string
  loginOnBlur: boolean
  emailError: string
  emailOnBlur: boolean
  passwordError: string
  passwordOnBlur: boolean
  passwordConfirmError: string
  passwordConfirmOnblur: boolean
  error: { message: string }
  [key: string]: string | boolean | Record<string, unknown>
}

interface RequiredInputsInterface {
  login: string
  email: string
  password: string
  passwordConfirm: string
}

const ERROR_DEFAULT_VALUES = {
  loginError: '',
  loginOnBlur: false,
  emailError: '',
  emailOnBlur: false,
  passwordError: '',
  passwordOnBlur: false,
  passwordConfirmError: '',
  passwordConfirmOnblur: false,
  error: { message: '' },
}

const Register: React.FC<Props> = ({ closeNavMobile }) => {
  const { firebase } = useFrequentVariables()
  const handleError = useContext(ErrorsHandlerContext)

  const localStorageContent = useContext(LocalStorageValueContext)
  const localStorageHandlers = useContext(LocalStorageHandlersContext)

  const [requiredInputs, setRequiredInputs] = useState<RequiredInputsInterface>({
    login: '',
    email: '',
    password: '',
    passwordConfirm: '',
  })
  // const [inputs, setInputs] = useState<InputsInterface>({ login: "" })
  const [errors, setErrors] = useState<FormErrorsInt>(ERROR_DEFAULT_VALUES)
  const [submitClicked, setSubmitClicked] = useState(false)
  const [submitRequestLoading, setSubmitRequestLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isEmailValid, setIsEmailValid] = useState(false)

  const history = useHistory()

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

    // context.userContentHandler.handleLoadingShowsOnRegister(true)

    try {
      const authUser: AuthUserFirebaseInterface = await firebase.createUserWithEmailAndPassword(email, password)

      const { watchingShows } = localStorageContent
      // const showEpisodesTMDB = await getShowEpisodesTMDB({ id: showDetailesTMDB.id })

      console.time('test')
      const episodesFullData = await Promise.all(
        watchingShows.map((show) => {
          return getShowEpisodesTMDB({ id: show.id })
        }),
      )

      console.log({ episodesFullData })

      const episodesModified = watchingShows.reduce((acc: any, show, index) => {
        const showEpisodesUserDatabase = formatShowEpisodesForUserDatabase(episodesFullData[index].episodes)
        acc[show.id] = showEpisodesUserDatabase

        return acc
      }, {})

      console.log({ episodesModified })

      console.timeEnd('test')
    } catch (err) {
      const error = err as ErrorInterface
      setErrors({ ...errorsOnSubmit, error: { message: error.message } })
      setSubmitRequestLoading(false)
      handleError({ errorData: error, message: 'Error occured durring register process. Please try again.' })
    }

    return

    firebase
      .createUserWithEmailAndPassword(email, password)
      .then((authUser: AuthUserFirebaseInterface) => {
        console.log({ authUser })

        firebase
          .user(authUser.user.uid)
          .set({
            username: requiredInputs.login,
            userNameLowerCase: requiredInputs.login.toLowerCase(),
            email,
            role: ROLES.USER,
          })
          .then(() => {
            // const watchingShows = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)!) || []
            // const watchLaterMovies = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)!) || []
            // context.userContentHandler.addShowsToDatabaseOnRegister({
            //   shows: watchingShows,
            //   uid: authUser.user.uid,
            // })
            // watchLaterMovies.forEach((item: MovieInterface) => {
            //   context.userContentHandler.handleMovieInDatabases({
            //     id: item.id,
            //     data: item,
            //     onRegister: true,
            //     userOnRegister: authUser.user,
            //   })
            // })
          })
          .then(() => {
            if (closeNavMobile) closeNavMobile()
          })
      })
      .then(() => firebase.sendEmailVerification())
      .then(() => {
        history.push(ROUTES.HOME_PAGE)
      })
      .catch((error: any) => {
        errorsOnSubmit.error = error
        setErrors(errorsOnSubmit)
        setSubmitRequestLoading(false)
        handleError({ errorData: error, message: 'Error occured durring register process. Please try again.' })
        // context.userContentHandler.handleLoadingShowsOnRegister(false)
      })
  }

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    const { value } = event.target
    const name = event.target.name === 'new-password' ? 'password' : event.target.name
    const errorsOnChange = { ...errors }

    if (errorsOnChange[`${name}OnBlur`] || submitClicked) {
      if (name === 'login') {
        errorsOnChange[`${name}Error`] = value.length >= 15 ? 'Login should be less than 15 characters' : ''
      }

      if (name === 'email') {
        errorsOnChange[`${name}Error`] = validEmailRegex.test(value) ? '' : 'Invalid email'
      }

      if (name === 'password') {
        errorsOnChange[`${name}Error`] = value.length >= 6 ? '' : 'Password should be at least 6 characters'

        errorsOnChange.passwordConfirmError =
          value !== requiredInputs.passwordConfirm && value.length >= 6 ? 'Passwords are not the same' : ''
      }

      if (name === 'passwordConfirm') {
        if (requiredInputs.password.length >= 6) {
          errorsOnChange[`${name}Error`] = requiredInputs.password !== value ? 'Passwords are not the same' : ''
        }
      }
    }

    if (name === 'email') setIsEmailValid(validEmailRegex.test(value))
    if (value === '') {
      errorsOnChange[`${name}Error`] = ''
      errorsOnChange[`${name}OnBlur`] = false
      errorsOnChange.error.message = ''
    }

    setErrors(errorsOnChange)
    setRequiredInputs({ ...requiredInputs, [name]: value })
    // setInputs({ ...inputs, [name]: value })
  }

  const handleValidationOnblur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.preventDefault()
    const { value } = event.target
    const name = event.target.name === 'new-password' ? 'password' : event.target.name

    const { login, email, password, passwordConfirm } = requiredInputs
    const errorsOnBlur = { ...errors }

    errorsOnBlur[`${name}OnBlur`] = true

    if (!submitClicked) {
      if (name === 'login') {
        errorsOnBlur[`${name}Error`] = login.length >= 15 ? 'Login should be less than 15 characters' : ''
      }

      if (name === 'email') {
        errorsOnBlur[`${name}Error`] = validEmailRegex.test(email) ? '' : 'Invalid email'
      }

      if (name === 'password') {
        errorsOnBlur[`${name}Error`] = password.length >= 6 ? '' : 'Password should be at least 6 characters'
      }

      if (name === 'passwordConfirm') {
        if (password.length >= 6) {
          errorsOnBlur[`${name}Error`] = password !== passwordConfirm ? 'Passwords are not the same' : ''
        }
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
    // setInputs({ ...inputs, [`${name}`]: "" })
    setErrors({ ...errors, [`${name}Error`]: '' })
  }

  const isFormValid = (errors: FormErrorsInt, requiredInputs: RequiredInputsInterface) => {
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
          'auth__form-input--error': errors.loginError,
        })}
        classNameLabel="auth__form-label"
        name="login"
        value={requiredInputs.login}
        handleOnChange={handleOnChange}
        handleValidation={handleValidationOnblur}
        handleKeyDown={handleKeyDown}
        type="text"
        placeholder="Login"
        labelText="Login"
        withLabel
      />
      <div className="auth__form-error">{errors.loginError}</div>

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
        classNameInput={classNames('auth__form-input  auth__form-input--password', {
          'auth__form-input--error': errors.passwordError,
        })}
        classNameLabel="auth__form-label"
        name="new-password"
        autocomplete="new-password"
        value={requiredInputs.password}
        handleOnChange={handleOnChange}
        handleValidation={handleValidationOnblur}
        handleKeyDown={handleKeyDown}
        type={!showPassword ? 'password' : 'text'}
        placeholder="Password"
        labelText="Password"
        hidePasswordBtn
        toggleShowPassword={toggleShowPassword}
        withLabel
      />
      <div className="auth__form-error">{errors.passwordError}</div>

      <Input
        classNameInput={classNames('auth__form-input auth__form-input--password', {
          'auth__form-input--error': errors.passwordConfirmError,
        })}
        classNameLabel="auth__form-label"
        name="passwordConfirm"
        value={requiredInputs.passwordConfirm}
        handleOnChange={handleOnChange}
        handleValidation={handleValidationOnblur}
        handleKeyDown={handleKeyDown}
        type={!showPassword ? 'password' : 'text'}
        placeholder="Password"
        labelText="Confirm Password"
        withLabel
      />
      <div className="auth__form-error">{errors.passwordConfirmError}</div>

      {errors.error && <div className="auth__form-error">{errors.error.message}</div>}

      <button
        className={classNames('button button--auth__form', {
          'button--disabled': !isFormValid(errors, requiredInputs) || !isEmailValid,
        })}
        type="submit"
      >
        {submitRequestLoading ? <span className="button-loader-circle" /> : 'Register'}
      </button>
      <SignInWithGoogleForm />
    </form>
  )
}

export default Register
