import React, { useContext, useEffect, useRef, useState } from "react"
import { NavLink } from "react-router-dom"
import classNames from "classnames"
import logo from "assets/images/main-page-logo.png"
import Login from "./Login"
import * as ROUTES from "Utils/Constants/routes"
import Search from "Components/Pages/SearchPage/Search/Search"
import useFrequentVariables from "Utils/Hooks/UseFrequentVariables"
import "./Header.scss"

type Props = {
  isLogoVisible?: boolean
  hideLogin?: boolean
  contactsPage?: boolean
}

const Header: React.FC<Props> = ({ isLogoVisible = true, hideLogin = false, contactsPage = false }) => {
  const { authUser, newContactsActivity } = useFrequentVariables()
  const [navMobileOpen, setNavMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const toggleNavButtonRef = useRef<HTMLButtonElement>(null)

  const closeNavMobile = () => {
    setNavMobileOpen(false)
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
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
      className={classNames("header", {
        "header--contacts-page": contactsPage
      })}
    >
      <nav
        ref={navRef}
        className={classNames("nav", {
          "nav--mobile-open": navMobileOpen
        })}
      >
        <ul
          className={classNames("nav__list", {
            "nav__list--not-auth": !authUser?.uid
          })}
        >
          <NavLink
            exact
            to={ROUTES.HOME_PAGE}
            activeClassName="nav__item--active"
            className="nav__link--logo"
            onClick={() => closeNavMobile()}
          >
            <li className="nav__item nav__item--logo"></li>
          </NavLink>

          {authUser?.uid && (
            <>
              <NavLink
                exact
                to={ROUTES.CALENDAR}
                className={classNames("nav__link", {
                  "nav__link--non-auth": !authUser?.uid
                })}
                activeClassName="nav__item--active"
                onClick={() => closeNavMobile()}
              >
                <li className="nav__item">Calendar</li>
              </NavLink>

              <NavLink
                exact
                to={ROUTES.TO_WATCH}
                className={classNames("nav__link", {
                  "nav__link--non-auth": !authUser?.uid
                })}
                activeClassName="nav__item--active"
                onClick={() => closeNavMobile()}
              >
                <li className="nav__item">To Watch</li>
              </NavLink>
            </>
          )}

          <NavLink
            exact
            to={ROUTES.SHOWS}
            className={classNames("nav__link", {
              "nav__link--non-auth": !authUser?.uid
            })}
            activeClassName="nav__item--active"
            onClick={() => closeNavMobile()}
          >
            <li className="nav__item">Shows</li>
          </NavLink>

          <NavLink
            exact
            to={ROUTES.MOVIES}
            className={classNames("nav__link", {
              "nav__link--non-auth": !authUser?.uid
            })}
            activeClassName="nav__item--active"
            onClick={() => closeNavMobile()}
          >
            <li className="nav__item">Movies</li>
          </NavLink>

          {authUser?.uid ? (
            <>
              <div className="nav__link nav__link--dropdown">
                <div className="nav__item--dropdown-mobile">
                  <NavLink
                    exact
                    to={ROUTES.CONTACTS_PAGE}
                    className={classNames("nav__link", {
                      "nav__link--non-auth": !authUser?.uid
                    })}
                    activeClassName="nav__item--active"
                    onClick={() => closeNavMobile()}
                  >
                    <li
                      className={classNames("nav__item", {
                        "nav__item--new-activity": newContactsActivity
                      })}
                    >
                      Contacts
                    </li>
                  </NavLink>

                  <NavLink
                    exact
                    to={ROUTES.SETTINGS}
                    className={classNames("nav__link", {
                      "nav__link--non-auth": !authUser?.uid
                    })}
                    activeClassName="nav__item--active"
                    onClick={() => closeNavMobile()}
                  >
                    <li className="nav__item" onClick={() => closeNavMobile()}>
                      Settings
                    </li>
                  </NavLink>
                </div>

                <li
                  className={classNames("nav__item nav__item--dropdown", {
                    "nav__item--new-activity": newContactsActivity
                  })}
                >
                  Profile
                  <ul className="nav__list--dropdown">
                    <NavLink
                      exact
                      to={ROUTES.CONTACTS_PAGE}
                      className={classNames("nav__link", {
                        "nav__link--non-auth": !authUser?.uid
                      })}
                      activeClassName="nav__item--active"
                      onClick={() => closeNavMobile()}
                    >
                      <li
                        className={classNames("nav__item", {
                          "nav__item--contacts": newContactsActivity
                        })}
                      >
                        Contacts
                      </li>
                    </NavLink>
                    <NavLink
                      exact
                      to={ROUTES.SETTINGS}
                      className={classNames("nav__link", {
                        "nav__link--non-auth": !authUser?.uid
                      })}
                      activeClassName="nav__item--active"
                      onClick={() => closeNavMobile()}
                    >
                      <li className="nav__item" onClick={() => closeNavMobile()}>
                        Settings
                      </li>
                    </NavLink>
                  </ul>
                </li>
              </div>

              {/* {authUser.roles && !!authUser?.uid.roles[ROLES.ADMIN] && (
                <NavLink exact to={ROUTES.ADMIN} className="nav__link">
                  <li className="nav__item" onClick={() => this.closeNavMobile()}>
                    Admin
                  </li>
                </NavLink>
              )} */}
            </>
          ) : (
            <>{!hideLogin && <Login closeNavMobile={closeNavMobile} />}</>
          )}

          <li
            className={classNames("nav__item nav__item--nav-search", {
              "nav__item--nav-search__non-auth": !authUser?.uid
            })}
          >
            <Search navSearch={true} navRef={navRef} closeNavMobile={closeNavMobile} />
          </li>
        </ul>
      </nav>
      <button
        type="button"
        ref={toggleNavButtonRef}
        className={classNames("header__show-nav", {
          "header__show-nav--open": navMobileOpen
        })}
        onClick={() => setNavMobileOpen(!navMobileOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div
        className="logo"
        style={
          isLogoVisible
            ? {
                display: "inherit"
              }
            : {
                display: "none"
              }
        }
      >
        <img width="517" height="190" className="logo__img" src={logo} alt="logo" />
      </div>
    </header>
  )
}

export default Header
