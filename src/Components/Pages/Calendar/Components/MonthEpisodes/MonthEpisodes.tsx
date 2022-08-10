import React, { useMemo, useState } from 'react'
import {
  SingleEpisodeByMonthInterface,
  UserWillAirEpisodesInterface,
} from 'Components/UserContent/UseUserShowsRed/@Types'
import classNames from 'classnames'
import { currentDate } from 'Utils'
import { differenceInCalendarDays } from 'date-fns'
import { Link } from 'react-router-dom'
import TorrentLinksEpisodes from 'Components/UI/Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/Components/TorrentLinksEpisodes/TorrentLinksEpisodes'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { organizeMonthEpisodesByEpisodeNumber } from '../../CalendarHelpers'

type Props = {
  monthEpisodesData: UserWillAirEpisodesInterface
  isMonthOpen: boolean
}

const MonthEpisodes: React.FC<Props> = ({ monthEpisodesData, isMonthOpen }) => {
  console.log({ monthEpisodesData })
  const { authUser } = useFrequentVariables()
  const [isOpen, setIsOpen] = useState(isMonthOpen)

  const date = new Date(monthEpisodesData.month)
  const monthLongName = date.toLocaleString('en', { month: 'long' })

  const monthEpisodes: SingleEpisodeByMonthInterface[] = useMemo(
    () => organizeMonthEpisodesByEpisodeNumber(monthEpisodesData.episodes),
    [monthEpisodesData],
  )

  return (
    <div key={monthEpisodesData.month} className="episodes__episode-group">
      <div
        className={classNames('episodes__episode-group-info', {
          'episodes__episode-group-info--open': isOpen,
        })}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="episodes__episode-group-name">
          {currentDate.getFullYear() !== date.getFullYear() ? (
            <>
              {monthLongName}
              <span>{date.getFullYear()}</span>
            </>
          ) : (
            monthLongName
          )}
        </div>
        <div className="episodes__episode-group-episodes-left">
          {monthEpisodesData.episodes.length}
          {monthEpisodesData.episodes.length > 1 ? 'episodes' : 'episode'}
        </div>
      </div>

      <div className="episodes__episode-list">
        {isOpen && (
          <>
            {monthEpisodes.map((episode, episodeIndex: number, array: any[]) => {
              const prevEpisode = array[episodeIndex - 1]
              const prevEpisodeAirDate = prevEpisode?.air_date

              // Format Date //
              const airDateISO = episode.air_date && new Date(episode.air_date).toISOString()

              const options: any = {
                weekday: 'short',
                day: 'numeric',
              }

              const formatedDate = new Date(airDateISO)

              const episodeAirDate = episode.air_date
                ? new Intl.DateTimeFormat('en-US', options).format(formatedDate).split(' ').join(', ')
                : 'No date available'
              // Format Date End //

              // Format Seasons And Episode Numbers //
              const seasonToString = episode.season_number?.toString()
              const episodeToString = episode.episode_number?.toString()

              const seasonNumber = seasonToString.length === 1 ? 's'.concat(seasonToString) : 's'.concat(seasonToString)
              const episodeNumber =
                episodeToString.length === 1 ? 'e0'.concat(episodeToString) : 'e'.concat(episodeToString)
              // Format Seasons And Episode Numbers End //
              const daysToNewEpisode = differenceInCalendarDays(new Date(episode.air_date), currentDate)

              const willAirToday = daysToNewEpisode === 0

              const handleDaysToNewEpisode = () => {
                if (daysToNewEpisode > 1) {
                  return `${daysToNewEpisode} days`
                }
                if (daysToNewEpisode === 1) {
                  return '1 day'
                }
                if (willAirToday) {
                  return 'Today'
                }
              }

              return (
                <div
                  key={episode.id}
                  className={classNames('episodes__episode', {
                    'episodes__episode--today': willAirToday,
                    'episodes__episode--today-admin':
                      authUser?.email === process.env.REACT_APP_ADMIN_EMAIL && willAirToday,
                  })}
                >
                  <div className="episodes__episode-wrapper">
                    <div className="episodes__episode-date">
                      {episode.air_date !== prevEpisodeAirDate && episodeAirDate}
                    </div>
                    <div className="episodes__episode-wrapper--calendar">
                      <div className="episodes__episode-show-name">
                        <Link to={`/show/${episode.showId}`}>{episode.show}</Link>
                      </div>
                      <div className="episodes__episode-episode-number">
                        {seasonNumber}
                        {episodeNumber}
                      </div>
                      <div className="episodes__episode-episode-title">{episode.name}</div>
                    </div>

                    {daysToNewEpisode >= 0 && (
                      <div className="episodes__episode-days-to-air">
                        {willAirToday && authUser?.email === process.env.REACT_APP_ADMIN_EMAIL && (
                          <TorrentLinksEpisodes
                            showTitle={episode.show}
                            seasonNumber={episode.season_number}
                            episodeNumber={episode.episode_number}
                          />
                        )}
                        <span>{handleDaysToNewEpisode()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

export default MonthEpisodes
