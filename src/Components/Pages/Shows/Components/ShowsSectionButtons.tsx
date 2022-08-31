import classNames from 'classnames'
import React from 'react'

type Props = {
  handleToggleSection: (section: string) => void
  activeSection: string
}

const ShowsSectionButtons: React.FC<Props> = ({ handleToggleSection, activeSection }) => (
  <div className="buttons__row buttons__row--shows-page">
    <div className="buttons__col">
      <button
        className={classNames('button', {
          'button--pressed': activeSection === 'watchingShows',
        })}
        type="button"
        onClick={() => handleToggleSection('watchingShows')}
      >
        Watching
      </button>
    </div>
    <div className="buttons__col">
      <button
        className={classNames('button', {
          'button--pressed': activeSection === 'droppedShows',
        })}
        type="button"
        onClick={() => handleToggleSection('droppedShows')}
      >
        Dropped
      </button>
    </div>
    <div className="buttons__col">
      <button
        className={classNames('button', {
          'button--pressed': activeSection === 'willWatchShows',
        })}
        type="button"
        onClick={() => handleToggleSection('willWatchShows')}
      >
        Will Watch
      </button>
    </div>
    <div className="buttons__col">
      <button
        className={classNames('button', {
          'button--pressed': activeSection === 'finishedShows',
        })}
        type="button"
        onClick={() => handleToggleSection('finishedShows')}
      >
        Finished
      </button>
    </div>
  </div>
)

export default ShowsSectionButtons
