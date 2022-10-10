import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import * as ROUTES from 'Utils/Constants/routes'
import Header from 'Components/UI/Header/Header'
import logo404 from 'assets/images/doge-404.png'
import Footer from 'Components/UI/Footer/Footer'
import './PageNotFound.scss'

const COUNTDOWN_INTERVAL = 1000

const PageNotFound: React.FC = () => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown((prevState) => prevState - 1)
    }, COUNTDOWN_INTERVAL)

    return () => {
      clearTimeout(countdownTimer)
    }
  }, [])

  useEffect(() => {
    if (countdown === 0) {
      navigate(ROUTES.HOME_PAGE)
    }
  }, [countdown, navigate])

  return (
    <>
      <Helmet>
        <title>So empty page | TV Junkie</title>
      </Helmet>
      <Header isLogoVisible={false} />
      <div className="page-not-found">
        <img className="page-not-found__img" src={logo404} alt="page not found" />
        <h1 className="page-not-found__heading">
          Very not existing page. You&lsquo;ll be redirected to{' '}
          <Link className="page-not-found__link" to={ROUTES.HOME_PAGE}>
            Home Page
          </Link>{' '}
          in{' '}
          <span>
            {countdown} {countdown === 1 ? 'second' : 'seconds'}
          </span>
        </h1>
      </div>
      <Footer />
    </>
  )
}

export default PageNotFound
