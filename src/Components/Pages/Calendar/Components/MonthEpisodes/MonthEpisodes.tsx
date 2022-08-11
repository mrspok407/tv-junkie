import React, { useMemo, useState } from 'react'
import {
  SingleEpisodeByMonthInterface,
  UserWillAirEpisodesInterface,
} from 'Components/UserContent/UseUserShowsRed/@Types'
import classNames from 'classnames'
import { currentDate } from 'Utils'
import compareAsc from 'date-fns/compareAsc'
import { format, getYear } from 'date-fns'
import { organizeMonthEpisodesByEpisodeNumber } from '../../CalendarHelpers'
import CalendarEpisode from './Episode/CalendarEpisode'

type Props = {
  monthEpisodesData: UserWillAirEpisodesInterface
  isMonthOpen: boolean
}

const MonthEpisodes: React.FC<Props> = ({ monthEpisodesData, isMonthOpen }) => {
  const [isOpen, setIsOpen] = useState(isMonthOpen)
  const monthDate = new Date(monthEpisodesData.month)

  const monthEpisodes: SingleEpisodeByMonthInterface[] = useMemo(
    () => organizeMonthEpisodesByEpisodeNumber(monthEpisodesData.episodes),
    [monthEpisodesData],
  )

  const monthName = format(monthDate, 'LLLL')
  const episodesPluralHandler = () => {
    if (monthEpisodesData.episodes.length > 1) return 'episodes'
    return 'episode'
  }

  const isMonthNextYear = getYear(currentDate) !== getYear(monthDate)

  return (
    <div key={monthEpisodesData.month} className="episodes__episode-group">
      <div
        className={classNames('episodes__episode-group-info', {
          'episodes__episode-group-info--open': isOpen,
        })}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className={classNames('episodes__episode-group-name', {
            'episodes__episode-group-name--next-year': isMonthNextYear,
          })}
        >
          {isMonthNextYear ? `${monthName} ${getYear(monthDate)}` : monthName}
        </div>
        <div className="episodes__episode-group-episodes-left">
          {`${monthEpisodesData.episodes.length} ${episodesPluralHandler()}`}
        </div>
      </div>

      <div className="episodes__episode-list">
        {isOpen && (
          <>
            {monthEpisodes.map((episode, episodeIndex, array) => {
              const prevEpisodeAirDate = new Date(array[episodeIndex - 1]?.air_date)
              const isAirDateShown =
                !prevEpisodeAirDate || compareAsc(prevEpisodeAirDate, new Date(episode.air_date)) !== 0

              return <CalendarEpisode key={episode.id} episodeData={episode} isAirDateShown={isAirDateShown} />
            })}
          </>
        )}
      </div>
    </div>
  )
}

export default MonthEpisodes
