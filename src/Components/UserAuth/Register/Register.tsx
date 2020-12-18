/* eslint-disable react/no-access-state-in-setstate */
import React, { useContext, useState } from "react"
import { useHistory } from "react-router-dom"
import { validEmailRegex } from "Utils"
import * as ROLES from "Utils/Constants/roles"
import * as ROUTES from "Utils/Constants/routes"
import classNames from "classnames"
import Input from "../Input/Input"
import { AppContext, MovieInterface } from "Components/AppContext/AppContextHOC"
import SignInWithGoogleForm from "../SignIn/SignInWithGoogle"
import { FirebaseContext } from "Components/Firebase"
import { AuthUserFirebaseInterface } from "Utils/Interfaces/UserAuth"

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = "watchingShowsLocalS"
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = "watchLaterMoviesLocalS"

type Props = {
  closeNavMobile: () => void
}

interface ErrorsInterface {
  emailError: string
  emailOnBlur: boolean
  passwordError: string
  passwordOnBlur: boolean
  passwordConfirmError: string
  passwordConfirmOnblur: boolean
  error: { message: string }
  [key: string]: string | boolean | {}
}

interface RequiredInputsInterface {
  email: string
  password: string
  passwordConfirm: string
}

interface InputsInterface {
  login: string
}

const ERROR_DEFAULT_VALUES = {
  emailError: "",
  emailOnBlur: false,
  passwordError: "",
  passwordOnBlur: false,
  passwordConfirmError: "",
  passwordConfirmOnblur: false,
  error: { message: "" }
}

const Register: React.FC<Props> = ({ closeNavMobile }) => {
  const [requiredInputs, setRequiredInputs] = useState<RequiredInputsInterface>({
    email: "",
    password: "",
    passwordConfirm: ""
  })
  const [inputs, setInputs] = useState<InputsInterface>({ login: "" })
  const [errors, setErrors] = useState<ErrorsInterface>(ERROR_DEFAULT_VALUES)
  const [submitClicked, setSubmitClicked] = useState(false)
  const [submitRequestLoading, setSubmitRequestLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isEmailValid, setIsEmailValid] = useState(false)

  const context = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const history = useHistory()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setSubmitRequestLoading(true)
    event.preventDefault()
    const { email, password } = requiredInputs
    const errorsOnSubmit = { ...errors }

    if (!isFormValid(errorsOnSubmit, requiredInputs)) {
      for (const [key, value] of Object.entries(requiredInputs)) {
        if (value.length === 0) {
          errorsOnSubmit[`${key}Error`] = "Required"
        }
      }
      setErrors(errorsOnSubmit)
      setSubmitClicked(true)
      setSubmitRequestLoading(false)
      return
    }

    context.userContentHandler.handleLoadingShowsOnRegister(true)

    firebase
      .createUserWithEmailAndPassword(email, password)
      .then((authUser: AuthUserFirebaseInterface) => {
        firebase
          .user(authUser.user.uid)
          .set({
            username: inputs.login,
            email,
            role: ROLES.USER
          })
          .then(() => {
            const watchingShows = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)!) || []
            const watchLaterMovies = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)!) || []

            context.userContentHandler.addShowsToDatabaseOnRegister({
              shows: watchingShows,
              uid: authUser.user.uid
            })

            watchLaterMovies.forEach((item: MovieInterface) => {
              context.userContentHandler.handleMovieInDatabases({
                id: item.id,
                data: item,
                onRegister: true,
                userOnRegister: authUser.user
              })
            })
          })
          .then(() => {
            localStorage.removeItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)
            localStorage.removeItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)

            context.userContentLocalStorage.clearContentState()

            if (closeNavMobile) closeNavMobile()
          })
      })
      .then(() => {
        return firebase.sendEmailVerification()
      })
      .then(() => {
        history.push(ROUTES.HOME_PAGE)
      })
      .catch((error: any) => {
        errorsOnSubmit.error = error
        setErrors(errorsOnSubmit)
        setSubmitRequestLoading(false)
        context.userContentHandler.handleLoadingShowsOnRegister(false)
      })
  }

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    const value = event.target.value
    const name = event.target.name === "new-password" ? "password" : event.target.name
    let errorsOnChange = { ...errors }

    if (errorsOnChange[`${name}OnBlur`] || submitClicked) {
      if (name === "email") {
        errorsOnChange[`${name}Error`] = validEmailRegex.test(value) ? "" : "Invalid email"
      }

      if (name === "password") {
        errorsOnChange[`${name}Error`] = value.length >= 6 ? "" : "Password should be at least 6 characters"

        errorsOnChange.passwordConfirmError =
          value !== requiredInputs.passwordConfirm && value.length >= 6 ? "Passwords are not the same" : ""
      }

      if (name === "passwordConfirm") {
        if (requiredInputs.password.length >= 6)
          errorsOnChange[`${name}Error`] = requiredInputs.password !== value ? "Passwords are not the same" : ""
      }
    }

    if (name === "email") setIsEmailValid(validEmailRegex.test(value))
    if (value === "") {
      errorsOnChange[`${name}Error`] = ""
      errorsOnChange[`${name}OnBlur`] = false
      errorsOnChange.error.message = ""
    }

    setErrors(errorsOnChange)
    setRequiredInputs({ ...requiredInputs, [name]: value })
    setInputs({ ...inputs, [name]: value })
  }

  const handleValidationOnblur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.preventDefault()
    const { value } = event.target
    const name = event.target.name === "new-password" ? "password" : event.target.name

    const { email, password, passwordConfirm } = requiredInputs
    const errorsOnBlur = { ...errors }

    errorsOnBlur[`${name}OnBlur`] = true

    if (!submitClicked) {
      if (name === "email") {
        errorsOnBlur[`${name}Error`] = validEmailRegex.test(email) ? "" : "Invalid email"
      }

      if (name === "password") {
        errorsOnBlur[`${name}Error`] = password.length >= 6 ? "" : "Password should be at least 6 characters"
      }

      if (name === "passwordConfirm") {
        if (password.length >= 6)
          errorsOnBlur[`${name}Error`] = password !== passwordConfirm ? "Passwords are not the same" : ""
      }

      if (value === "") {
        errorsOnBlur[`${name}Error`] = ""
        errorsOnBlur[`${name}OnBlur`] = false
      }
    }
    setErrors(errorsOnBlur)
  }

  const handleKeyDown = (e: any) => e.which === 27 && resetInput(e.target.name)

  const resetInput = (name: string) => {
    setRequiredInputs({ ...requiredInputs, [`${name}`]: "" })
    setInputs({ ...inputs, [`${name}`]: "" })
    setErrors({ ...errors, [`${name}Error`]: "" })
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
        classNameInput="auth__form-input"
        classNameLabel="auth__form-label"
        name="login"
        value={inputs.login}
        handleOnChange={handleOnChange}
        handleKeyDown={handleKeyDown}
        type="text"
        placeholder="Login"
        labelText="Login"
        withLabel
      />

      <Input
        classNameInput={classNames("auth__form-input", {
          "auth__form-input--error": errors.emailError
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
        classNameInput={classNames("auth__form-input  auth__form-input--password", {
          "auth__form-input--error": errors.passwordError
        })}
        classNameLabel="auth__form-label"
        name="new-password"
        autocomplete="new-password"
        value={requiredInputs.password}
        handleOnChange={handleOnChange}
        handleValidation={handleValidationOnblur}
        handleKeyDown={handleKeyDown}
        type={!showPassword ? "password" : "text"}
        placeholder="Password"
        labelText="Password"
        hidePasswordBtn={true}
        toggleShowPassword={toggleShowPassword}
        withLabel
      />
      <div className="auth__form-error">{errors.passwordError}</div>

      <Input
        classNameInput={classNames("auth__form-input auth__form-input--password", {
          "auth__form-input--error": errors.passwordConfirmError
        })}
        classNameLabel="auth__form-label"
        name="passwordConfirm"
        value={requiredInputs.passwordConfirm}
        handleOnChange={handleOnChange}
        handleValidation={handleValidationOnblur}
        handleKeyDown={handleKeyDown}
        type={!showPassword ? "password" : "text"}
        placeholder="Password"
        labelText="Confirm Password"
        withLabel
      />
      <div className="auth__form-error">{errors.passwordConfirmError}</div>

      {errors.error && <div className="auth__form-error">{errors.error.message}</div>}

      <button
        className={classNames("button button--auth__form", {
          "button--disabled": !isFormValid(errors, requiredInputs) || !isEmailValid
        })}
        type="submit"
      >
        {submitRequestLoading ? <span className="auth__form-loading"></span> : "Register"}
      </button>
      <SignInWithGoogleForm />
    </form>
  )
}

export default Register
