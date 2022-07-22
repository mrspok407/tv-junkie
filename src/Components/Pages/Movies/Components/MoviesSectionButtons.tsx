import classNames from 'classnames'
import React from 'react'

type Props = {
  handleToggleSection: (section: string) => void
  activeSection: string
}

const MoviesSectionButtons: React.FC<Props> = ({ handleToggleSection, activeSection }) => (
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
        onClick={() => handleToggleSection('finishedMovies')}
      >
        Finished
      </button>
    </div>
  </div>
)

export default MoviesSectionButtons
