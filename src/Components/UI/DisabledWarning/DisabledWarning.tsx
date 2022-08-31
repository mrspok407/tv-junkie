import classNames from 'classnames'
import React from 'react'
import { Link } from 'react-router-dom'
import * as ROUTES from 'Utils/Constants/routes'
import './DisabledWarning.scss'

type Props = {
  fadeOutStart: boolean
}

const DisableWarning: React.FC<Props> = ({ fadeOutStart }) => {
  return (
    <div
      className={classNames('disabled-warning', {
        'disabled-warning--fade-out': fadeOutStart,
      })}
    >
      To use full features please{' '}
      <Link className="buttons__col-link" to={ROUTES.LOGIN_PAGE}>
        register
      </Link>
      . Your already selected shows will be saved.
    </div>
  )
}

export default DisableWarning
