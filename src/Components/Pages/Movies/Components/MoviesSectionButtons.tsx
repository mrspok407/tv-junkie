import classNames from 'classnames'
import React from 'react'
import { MovieSectionOptions } from '../ReducerConfig/@Types'

type Props = {
  handleToggleSection: (section: MovieSectionOptions) => void
  activeSection: string
}

const MoviesSectionButtons: React.FC<Props> = ({ handleToggleSection, activeSection }) => (
  <div className="buttons__row buttons__row--shows-page">
    <div className="buttons__col">
      <button
        className={classNames('button', {
          'button--pressed': activeSection === MovieSectionOptions.WatchLater,
        })}
        type="button"
        onClick={() => handleToggleSection(MovieSectionOptions.WatchLater)}
      >
        Watch later
      </button>
    </div>
    <div className="buttons__col">
      <button
        className={classNames('button', {
          'button--pressed': activeSection === MovieSectionOptions.Finished,
        })}
        type="button"
        onClick={() => handleToggleSection(MovieSectionOptions.Finished)}
      >
        Finished
      </button>
    </div>
  </div>
)

export default MoviesSectionButtons
