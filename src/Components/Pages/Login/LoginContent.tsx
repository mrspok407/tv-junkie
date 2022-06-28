import React from 'react'
import UserAuthForm from 'Components/UI/UserAuthForm/UserAuthForm'
import useGoogleRedirect from 'Components/UserAuth/SignIn/UseGoogleRedirect'
import './Login.scss'

const LoginContent: React.FC = () => {
  useGoogleRedirect()
  return (
    <div className="login-page">
      <UserAuthForm loginPage />
    </div>
  )
}

export default LoginContent
