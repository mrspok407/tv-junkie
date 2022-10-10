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
          <NavLink
            to={ROUTES.CONTACTS_PAGE}
            className={({ isActive }) =>
              classNames('nav__link', {
                'nav__link--non-auth': !authUser?.uid,
                'nav__item--active': isActive,
              })
            }
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
            to={ROUTES.SETTINGS}
            className={({ isActive }) =>
              classNames('nav__link', {
                'nav__link--non-auth': !authUser?.uid,
                'nav__item--active': isActive,
              })
            }
            onClick={() => closeNavMobile()}
          >
            <li className="nav__item" onClick={() => closeNavMobile()}>
              Settings
            </li>
          </NavLink>
        </>
      ) : (
        <>{!hideLogin && <Login closeNavMobile={closeNavMobile} />}</>
      )}
    </>
  )
}

export default ProfileMenu
