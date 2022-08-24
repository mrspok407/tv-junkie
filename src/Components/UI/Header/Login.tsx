import React, { useState, useRef } from 'react'
import UserAuthForm from 'Components/UI/UserAuthForm/UserAuthForm'

type Props = {
  closeNavMobile?: () => void
}

const Login: React.FC<Props> = ({ closeNavMobile }) => {
  const [authContOpen, setAuthContOpen] = useState(false)
  const authContRef = useRef<HTMLDivElement>(null)

  return (
    <div className="login__container">
      <div onClick={() => setAuthContOpen((prevState) => !prevState)} className="nav__item nav__item--login">
        Login
      </div>
      {authContOpen && <UserAuthForm authContRef={authContRef} closeNavMobile={closeNavMobile} />}
    </div>
  )
}

export default Login
