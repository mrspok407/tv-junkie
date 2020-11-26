import React, { useState, useRef, useEffect } from "react"
import UserAuthForm from "Components/UI/UserAuthForm/UserAuthForm"

type Props = {
  closeNavMobile?: () => void
}

const Login: React.FC<Props> = ({ closeNavMobile }) => {
  const [authContOpen, setAuthContOpen] = useState(false)
  const authContRef = useRef<HTMLDivElement>(null)
  const loginButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, [])

  const handleClickOutside = (e: CustomEvent) => {
    if (
      loginButtonRef.current === e.target ||
      !authContRef.current ||
      authContRef.current.contains(e.target as Node)
    ) {
      return
    }

    setAuthContOpen(false)
  }

  return (
    <div className="login__container">
      <div
        ref={loginButtonRef}
        onClick={() => setAuthContOpen((prevState) => !prevState)}
        className="nav__item nav__item--login"
      >
        Login
      </div>
      {authContOpen && <UserAuthForm authContRef={authContRef} closeNavMobile={closeNavMobile} />}
    </div>
  )
}

export default Login
