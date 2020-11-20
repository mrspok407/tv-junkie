import React, { useRef, useState } from "react"
import { NavLink } from "react-router-dom"
import classNames from "classnames"
import logo from "assets/images/main-page-logo.png"
import Login from "./Login"
import * as ROUTES from "Utils/Constants/routes"
import Search from "Components/Pages/SearchPage/Search/Search"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"
import "./Header.scss"

type Props = {
  isLogoVisible?: boolean
  hideLogin?: boolean
}

const Header: React.FC<Props> = ({ isLogoVisible = true, hideLogin = false }) => {
  const [navMobileOpen, setNavMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const authUser = useAuthUser()

  const closeNavMobile = () => {
    setNavMobileOpen(false)
  }

  return (
    <header className="header">
      <nav
        ref={navRef}
        className={classNames("nav", {
          "nav--mobile-open": navMobileOpen
        })}
      >
        <ul
          className={classNames("nav__list", {
            "nav__list--not-auth": !authUser
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

          {authUser && (
            <>
              <NavLink
                exact
                to={ROUTES.CALENDAR}
                className={classNames("nav__link", {
                  "nav__link--non-auth": !authUser
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
                  "nav__link--non-auth": !authUser
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
              "nav__link--non-auth": !authUser
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
              "nav__link--non-auth": !authUser
            })}
            activeClassName="nav__item--active"
            onClick={() => closeNavMobile()}
          >
            <li className="nav__item">Movies</li>
          </NavLink>

          {authUser ? (
            <>
              <NavLink
                exact
                to={ROUTES.PROFILE}
                className={classNames("nav__link", {
                  "nav__link--non-auth": !authUser
                })}
              >
                <li className="nav__item" onClick={() => closeNavMobile()}>
                  Profile
                </li>
              </NavLink>

              {/* {authUser.roles && !!authUser.roles[ROLES.ADMIN] && (
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
              "nav__item--nav-search__non-auth": !authUser
            })}
          >
            <Search navSearch={true} navRef={navRef} closeNavMobile={closeNavMobile} />
          </li>
        </ul>
      </nav>
      <button
        type="button"
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
        <img className="logo__img" src={logo} alt="logo" />
      </div>
    </header>
  )
}

export default Header
