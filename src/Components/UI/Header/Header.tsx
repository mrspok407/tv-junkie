import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import classNames from 'classnames'
import logo from 'assets/images/main-page-logo.png'
import * as ROUTES from 'Utils/Constants/routes'
import Search from 'Components/Pages/SearchPage/Search/Search'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import ProfileMenu from './Components/ProfileMenu'
import './Header.scss'

type Props = {
  isLogoVisible?: boolean
  hideLogin?: boolean
  contactsPage?: boolean
}

const Header: React.FC<Props> = ({ isLogoVisible = true, hideLogin = false, contactsPage = false }) => {
  const { authUser } = useFrequentVariables()
  const [navMobileOpen, setNavMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const toggleNavButtonRef = useRef<HTMLButtonElement>(null)

  const closeNavMobile = () => {
    setNavMobileOpen(false)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside as EventListener)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener)
    }
  }, [])

  const handleClickOutside = (e: CustomEvent) => {
    if (toggleNavButtonRef?.current?.contains(e.target as Node)) {
      return
    }
    if (!navRef?.current?.contains(e.target as Node)) {
      setNavMobileOpen(false)
    }
  }

  return (
    <header
      className={classNames('header', {
        'header--contacts-page': contactsPage,
      })}
    >
      <div
        className={classNames('nav-container', {
          'nav-container--mobile-open': navMobileOpen,
        })}
      >
        <nav ref={navRef} className={classNames('nav')}>
          <ul
            className={classNames('nav__list', {
              'nav__list--not-auth': !authUser?.uid,
            })}
          >
            <NavLink
              to={ROUTES.HOME_PAGE}
              className={({ isActive }) =>
                classNames('nav__link--logo', {
                  'nav__item--active': isActive,
                })
              }
              onClick={() => closeNavMobile()}
            >
              <li className="nav__item nav__item--logo" />
            </NavLink>

            {authUser?.uid && (
              <>
                <NavLink
                  to={ROUTES.CALENDAR}
                  className={({ isActive }) =>
                    classNames('nav__link', {
                      'nav__link--non-auth': !authUser?.uid,
                      'nav__item--active': isActive,
                    })
                  }
                  onClick={() => closeNavMobile()}
                >
                  <li className="nav__item">Calendar</li>
                </NavLink>

                <NavLink
                  to={ROUTES.TO_WATCH}
                  className={({ isActive }) =>
                    classNames('nav__link', {
                      'nav__link--non-auth': !authUser?.uid,
                      'nav__item--active': isActive,
                    })
                  }
                  onClick={() => closeNavMobile()}
                >
                  <li className="nav__item">To Watch</li>
                </NavLink>
              </>
            )}

            <NavLink
              to={ROUTES.SHOWS}
              className={({ isActive }) =>
                classNames('nav__link', {
                  'nav__link--non-auth': !authUser?.uid,
                  'nav__item--active': isActive,
                })
              }
              onClick={() => closeNavMobile()}
            >
              <li className="nav__item">Shows</li>
            </NavLink>

            <NavLink
              to={ROUTES.MOVIES}
              className={({ isActive }) =>
                classNames('nav__link', {
                  'nav__link--non-auth': !authUser?.uid,
                  'nav__item--active': isActive,
                })
              }
              onClick={() => closeNavMobile()}
            >
              <li className="nav__item">Movies</li>
            </NavLink>

            <ProfileMenu closeNavMobile={closeNavMobile} hideLogin={hideLogin} />

            <li
              className={classNames('nav__item nav__item--nav-search', {
                'nav__item--nav-search__non-auth': !authUser?.uid,
              })}
            >
              <Search navSearch closeNavMobile={closeNavMobile} />
            </li>
          </ul>
        </nav>
      </div>

      <button
        type="button"
        ref={toggleNavButtonRef}
        className={classNames('header__show-nav', {
          'header__show-nav--open': navMobileOpen,
        })}
        onClick={() => setNavMobileOpen(!navMobileOpen)}
      >
        <span />
        <span />
        <span />
      </button>
      <div
        className="logo"
        style={
          isLogoVisible
            ? {
                display: 'inherit',
              }
            : {
                display: 'none',
              }
        }
      >
        <Link to={ROUTES.HOME_PAGE} onClick={() => closeNavMobile()}>
          <img width="517" height="190" className="logo__img" src={logo} alt="logo" />
        </Link>
      </div>
    </header>
  )
}

export default Header
