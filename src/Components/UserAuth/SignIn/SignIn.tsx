/* eslint-disable react/no-access-state-in-setstate */
import React, { Component, useContext, useEffect, useState } from "react"
import { useHistory, withRouter } from "react-router-dom"
import { validEmailRegex } from "Utils"
import * as ROUTES from "Utils/Constants/routes"
import classNames from "classnames"
import Input from "../Input/Input"
import { AppContext } from "Components/AppContext/AppContextHOC"
import SignInWithGoogleForm from "./SignInWithGoogle"
import { FirebaseContext } from "Components/Firebase"

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = "watchingShowsLocalS"
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = "watchLaterMoviesLocalS"

type Props = {
  closeNavMobile: () => void
  togglePasswordForget: () => void
}

interface ErrorsInterface {
  emailError: string
  emailOnBlur: boolean
  passwordError: string
  error: { message: string }
  [key: string]: string | boolean | {}
}

interface RequiredInputsInterface {
  email: string
  password: string
}

const SignInFormBase: React.FC<Props> = ({ closeNavMobile, togglePasswordForget }) => {
  const [requiredInputs, setRequiredInputs] = useState<RequiredInputsInterface>({ email: "", password: "" })
  const [errors, setErrors] = useState<ErrorsInterface>({
    emailError: "",
    emailOnBlur: false,
    passwordError: "",
    error: { message: "" }
  })
  const [submitClicked, setSubmitClicked] = useState(false)
  const [submitRequestLoading, setSubmitRequestLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const context = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const history = useHistory()

  const onSubmit = (event: any) => {
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
      return
    }

    setSubmitRequestLoading(true)

    firebase
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        localStorage.removeItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)
        localStorage.removeItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)

        context.userContentLocalStorage.clearContentState()
        if (closeNavMobile) closeNavMobile()

        history.push(ROUTES.HOME_PAGE)
      })
      .catch((error: any) => {
        errorsOnSubmit.error = error
        setErrors(errorsOnSubmit)
        setSubmitRequestLoading(false)
      })
  }

  const handleOnChange = (event: any) => {
    event.preventDefault()
    const { value } = event.target
    const name = event.target.name === "current-password" ? "password" : event.target.name

    // const validation = () => {
    const email = value
    const errorsOnChange = { ...errors }

    if (errorsOnChange[`${name}OnBlur`] || submitClicked) {
      if (name === "email") {
        errorsOnChange[`${name}Error`] = validEmailRegex.test(email) ? "" : "Invalid email"
      }
      if (name === "password") {
        errorsOnChange.passwordError = ""
      }
    }

    if (value === "") {
      errorsOnChange[`${name}Error`] = ""
      errorsOnChange[`${name}OnBlur`] = false
      errorsOnChange.error.message = ""
    }

    setErrors(errorsOnChange)
    // }

    setRequiredInputs({ ...requiredInputs, [name]: value })
  }

  const handleValidationOnblur = (event: any) => {
    event.preventDefault()

    const { value, name } = event.target
    const { email } = requiredInputs
    const errorsOnBlur = { ...errors }

    errors[`${name}OnBlur`] = true

    if (!submitClicked) {
      if (name === "email") {
        errorsOnBlur[`${name}Error`] = validEmailRegex.test(email) ? "" : "Invalid email"
      }

      if (name === "password") {
        errorsOnBlur.passwordError = ""
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
        classNameInput={classNames("auth__form-input auth__form-input--password", {
          "auth__form-input--error": errors.passwordError
        })}
        classNameLabel="auth__form-label"
        name="current-password"
        autocomplete="current-password"
        value={requiredInputs.password}
        handleOnChange={handleOnChange}
        handleKeyDown={handleKeyDown}
        type={!showPassword ? "password" : "text"}
        placeholder="Password"
        labelText="Password"
        hidePasswordBtn={true}
        toggleShowPassword={toggleShowPassword}
        withLabel
      />

      <div className="auth__form-error">{errors.passwordError}</div>

      {errors.error && <div className="auth__form-error">{errors.error.message}</div>}

      <span onClick={togglePasswordForget} className="auth__form-password-link">
        Forget password?
      </span>

      <button
        className={classNames("button button--auth__form", {
          "button--disabled": !isFormValid(errors, requiredInputs)
        })}
        type="submit"
      >
        {submitRequestLoading ? <span className="auth__form-loading"></span> : "Sign In"}
      </button>
      <SignInWithGoogleForm />
    </form>
  )
}

export default SignInFormBase

// const INITIAL_STATE = {
//   requiredInputs: {
//     email: "",
//     password: ""
//   },
//   errors: {
//     emailError: "",
//     emailOnBlur: false,
//     passwordError: "",
//     error: ""
//   },
//   submitClicked: false,
//   submitRequestLoading: false,
//   showPassword: false
// }

// class SignInFormBase extends Component {
//   constructor(props) {
//     super(props)

//     this.state = { ...INITIAL_STATE }
//   }

//   onSubmit = (event) => {
//     event.preventDefault()
//     const { email, password } = this.state.requiredInputs
//     const errors = { ...this.state.errors }

//     if (!this.isFormValid(errors, this.state.requiredInputs)) {
//       for (const [key, value] of Object.entries(this.state.requiredInputs)) {
//         if (value.length === 0) {
//           errors[`${key}Error`] = "Required"
//         }
//       }
//       this.setState({
//         errors,
//         submitClicked: true
//       })
//       return
//     }

//     this.setState({ submitRequestLoading: true })

//     this.context.firebase
//       .signInWithEmailAndPassword(email, password)
//       .then(() => {
//         localStorage.removeItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)
//         localStorage.removeItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)

//         this.context.userContentLocalStorage.clearContentState()
//         if (this.props.closeNavMobile) this.props.closeNavMobile()

//         this.setState({ ...INITIAL_STATE })
//         this.props.history.push(ROUTES.HOME_PAGE)
//       })
//       .catch((error) => {
//         errors.error = error
//         this.setState({ errors, submitRequestLoading: false })
//       })
//   }

//   handleOnChange = (event) => {
//     event.preventDefault()
//     const { value } = event.target

//     const name = event.target.name === "current-password" ? "password" : event.target.name

//     const validation = () => {
//       const { email } = this.state.requiredInputs
//       const errors = { ...this.state.errors }

//       if (errors[`${name}OnBlur`] || this.state.submitClicked) {
//         if (name === "email") {
//           errors[`${name}Error`] = validEmailRegex.test(email) ? "" : "Invalid email"
//         }
//         if (name === "password") {
//           errors.passwordError = ""
//         }
//       }

//       if (value === "") {
//         errors[`${name}Error`] = ""
//         errors[`${name}OnBlur`] = false
//         errors.error = ""
//       }

//       this.setState({
//         errors
//       })
//     }

//     this.setState(
//       (prevState) => ({
//         requiredInputs: { ...prevState.requiredInputs, [name]: value }
//       }),
//       validation
//     )
//   }

//   handleValidationOnblur = (event) => {
//     event.preventDefault()

//     const { value, name } = event.target
//     const { email } = this.state.requiredInputs
//     const errors = { ...this.state.errors }

//     errors[`${name}OnBlur`] = true

//     if (!this.state.submitClicked) {
//       if (name === "email") {
//         errors[`${name}Error`] = validEmailRegex.test(email) ? "" : "Invalid email"
//       }

//       if (name === "password") {
//         errors.passwordError = ""
//       }

//       if (value === "") {
//         errors[`${name}Error`] = ""
//         errors[`${name}OnBlur`] = false
//       }
//     }

//     this.setState({
//       errors
//     })
//   }

//   handleKeyDown = (e) => e.which === 27 && this.resetInput(e.target.name)

//   resetInput = (name) => {
//     this.setState({
//       requiredInputs: { ...this.state.requiredInputs, [`${name}`]: "" },
//       errors: { ...this.state.errors, [`${name}Error`]: "" }
//     })
//   }

//   isFormValid = (errors, requiredInputs) => {
//     let isValid = true

//     for (const value of Object.values(requiredInputs)) {
//       if (value.length === 0) {
//         isValid = false
//       }
//     }

//     for (const value of Object.values(errors)) {
//       if (value.length > 0) {
//         isValid = false
//       }
//     }

//     return isValid
//   }

//   toggleShowPassword = () => {
//     this.setState({
//       showPassword: !this.state.showPassword
//     })
//   }

//   render() {
//     const { errors, requiredInputs } = this.state
//     const { email, password } = this.state.requiredInputs
//     const { error, emailError, passwordError } = this.state.errors

//     const isValid = this.isFormValid(errors, requiredInputs)

//     return (
//       <form className="auth__form" onSubmit={this.onSubmit}>
//         <Input
//           classNameInput={classNames("auth__form-input", {
//             "auth__form-input--error": emailError
//           })}
//           classNameLabel="auth__form-label"
//           name="email"
//           value={email}
//           handleOnChange={this.handleOnChange}
//           handleValidation={this.handleValidationOnblur}
//           handleKeyDown={this.handleKeyDown}
//           type="text"
//           placeholder="Email Address"
//           labelText="Email"
//           withLabel
//         />
//         <div className="auth__form-error">{emailError}</div>

//         <Input
//           classNameInput={classNames("auth__form-input auth__form-input--password", {
//             "auth__form-input--error": passwordError
//           })}
//           classNameLabel="auth__form-label"
//           name="current-password"
//           autocomplete="current-password"
//           value={password}
//           handleOnChange={this.handleOnChange}
//           handleKeyDown={this.handleKeyDown}
//           type={!this.state.showPassword ? "password" : "text"}
//           placeholder="Password"
//           labelText="Password"
//           hidePasswordBtn={true}
//           toggleShowPassword={this.toggleShowPassword}
//           withLabel
//         />

//         <div className="auth__form-error">{passwordError}</div>

//         {error && <div className="auth__form-error">{error.message}</div>}

//         <span onClick={this.props.togglePasswordForget} className="auth__form-password-link">
//           Forget password?
//         </span>

//         <button
//           className={classNames("button button--auth__form", {
//             "button--disabled": !isValid
//           })}
//           type="submit"
//         >
//           {this.state.submitRequestLoading ? <span className="auth__form-loading"></span> : "Sign In"}
//         </button>
//         <SignInWithGoogleForm />
//       </form>
//     )
//   }
// }

// const SignInForm = withRouter(SignInFormBase)

// export default SignInForm

// SignInFormBase.contextType = AppContext
