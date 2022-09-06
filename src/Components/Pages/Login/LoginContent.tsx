import React from 'react'
import UserAuthForm from 'Components/UI/UserAuthForm/UserAuthForm'
import './Login.scss'

const LoginContent: React.FC = () => {
  return (
    <div className="login-page">
      <UserAuthForm loginPage />
    </div>
  )
}

export default LoginContent
