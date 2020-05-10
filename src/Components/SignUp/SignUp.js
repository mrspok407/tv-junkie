import React, { Component } from "react"
import { Link, withRouter } from "react-router-dom"
import { compose } from "recompose"
import { withFirebase } from "../Firebase"

const SignUpPage = () => (
  <div>
    <h1>SignUp</h1>
    <SignUpForm />
  </div>
)

const INITIAL_STATE = {
  username: "",
  email: "",
  password: "",
  passwordConfirm: "",
  error: null
}

class SignUpFormBase extends Component {
  constructor(props) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  onSubmit = event => {
    const { username, email, password } = this.state
    const firebase = this.props.firebase
    const history = this.props.history

    firebase
      .createUserWithEmailAndPassword(email, password)
      .then(authUser => {
        this.setState({ ...INITIAL_STATE })
        history.push("/")
        console.log(`user created: ${authUser}`)
      })
      .catch(error => {
        this.setState({ error })
        console.log("error")
      })

    event.preventDefault()
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {
    const { username, email, password, passwordConfirm, error } = this.state
    const isInvalid =
      password !== passwordConfirm || password === "" || email === "" || username === ""

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="username"
          value={username}
          onChange={this.onChange}
          type="text"
          placeholder="Full Name"
        />
        <input
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <input
          name="password"
          value={password}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <input
          name="passwordConfirm"
          value={passwordConfirm}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm Password"
        />
        <button disabled={isInvalid} type="submit">
          Sign Up
        </button>

        {error && <p>{error.message}</p>}
      </form>
    )
  }
}

// const SignUpForm = withRouter(withFirebase(SignUpFormBase))

const SignUpForm = compose(withRouter, withFirebase)(SignUpFormBase)

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to="/signup">Sign Up</Link>
  </p>
)

export default SignUpPage

export { SignUpForm, SignUpLink }
