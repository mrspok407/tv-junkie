import classNames from 'classnames'
import React from 'react'

type Props = {
  toggleSection: (section: string) => void
  activeSection: string
}

const ShowsSectionButtons: React.FC<Props> = ({ toggleSection, activeSection }) => (
  <div className="buttons__row buttons__row--shows-page">
    <div className="buttons__col">
      <button
        className={classNames('button', {
          'button--pressed': activeSection === 'watchingShows',
        })}
        type="button"
        onClick={() => toggleSection('watchingShows')}
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
        onClick={() => toggleSection('droppedShows')}
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
        onClick={() => toggleSection('willWatchShows')}
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
        onClick={() => toggleSection('finishedShows')}
      >
        Finished
      </button>
    </div>
  </div>
)

export default ShowsSectionButtons
