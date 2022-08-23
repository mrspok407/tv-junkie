import classNames from 'classnames'
import { ContactsActivityContext } from 'Components/AppContext/Contexts/ContactsActivityContext'
import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import * as ROUTES from 'Utils/Constants/routes'

import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import Login from '../Login'

type Props = {
  closeNavMobile: () => void
  hideLogin?: boolean
}

const ProfileMenu: React.FC<Props> = ({ closeNavMobile, hideLogin = false }) => {
  const { authUser } = useFrequentVariables()
  const newContactsActivity = useContext(ContactsActivityContext)

  return (
    <>
      {authUser?.uid ? (
        <>
          {/* <div className="nav__link nav__link--dropdown"> */}
          {/* <div className="nav__item--dropdown-mobile"> */}
          <NavLink
            exact
            to={ROUTES.CONTACTS_PAGE}
            className={classNames('nav__link', {
              'nav__link--non-auth': !authUser?.uid,
            })}
            activeClassName="nav__item--active"
            onClick={() => closeNavMobile()}
          >
            <li
              className={classNames('nav__item', {
                'nav__item--new-activity': newContactsActivity,
              })}
            >
              Contacts
            </li>
          </NavLink>

          <NavLink
            exact
            to={ROUTES.SETTINGS}
            className={classNames('nav__link', {
              'nav__link--non-auth': !authUser?.uid,
            })}
            activeClassName="nav__item--active"
            onClick={() => closeNavMobile()}
          >
            <li className="nav__item" onClick={() => closeNavMobile()}>
              Settings
            </li>
          </NavLink>
          {/* </div> */}

          {/* <li
              className={classNames('nav__item nav__item--dropdown', {
                'nav__item--new-activity': newContactsActivity,
              })}
            >
              Profile
              <ul className="nav__list--dropdown">
                <NavLink
                  exact
                  to={ROUTES.CONTACTS_PAGE}
                  className={classNames('nav__link', {
                    'nav__link--non-auth': !authUser?.uid,
                  })}
                  activeClassName="nav__item--active"
                  onClick={() => closeNavMobile()}
                >
                  <li
                    className={classNames('nav__item', {
                      'nav__item--contacts': newContactsActivity,
                    })}
                  >
                    Contacts
                  </li>
                </NavLink>
                <NavLink
                  exact
                  to={ROUTES.SETTINGS}
                  className={classNames('nav__link', {
                    'nav__link--non-auth': !authUser?.uid,
                  })}
                  activeClassName="nav__item--active"
                  onClick={() => closeNavMobile()}
                >
                  <li className="nav__item" onClick={() => closeNavMobile()}>
                    Settings
                  </li>
                </NavLink>
              </ul>
            </li> */}
          {/* </div> */}
        </>
      ) : (
        <>{!hideLogin && <Login closeNavMobile={closeNavMobile} />}</>
      )}
    </>
  )
}

export default ProfileMenu
