import React from 'react'
import { SingleEpisodeByMonthInterface } from 'Components/UserContent/UseUserShowsRed/@Types'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import TorrentLinksEpisodes from 'Components/UI/Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/Components/TorrentLinksEpisodes/TorrentLinksEpisodes'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useFormatMonthEpisodeDetails from './Hooks/UseFormatMonthEpisodeDetails'

type Props = {
  episodeData: SingleEpisodeByMonthInterface
  isAirDateShown: boolean
}

const CalendarEpisode: React.FC<Props> = ({ episodeData, isAirDateShown }) => {
  const { authUser } = useFrequentVariables()
  const { episodeAirDate, seasonNumber, episodeNumber, daysToNewEpisode, willAirToday, handleDaysToNewEpisode } =
    useFormatMonthEpisodeDetails({ episodeData })

  return (
    <div
      key={episodeData.id}
      className={classNames('episodes__episode', {
        'episodes__episode--today': willAirToday,
        'episodes__episode--today-admin': authUser?.email === process.env.REACT_APP_ADMIN_EMAIL && willAirToday,
      })}
    >
      <div className="episodes__episode-wrapper">
        <div className="episodes__episode-date">{isAirDateShown && episodeAirDate}</div>
        <div className="episodes__episode-wrapper--calendar">
          <div className="episodes__episode-show-name">
            <Link to={`/show/${episodeData.showId}`}>{episodeData.show}</Link>
          </div>
          <div className="episodes__episode-episode-number">
            {seasonNumber}
            {episodeNumber}
          </div>
          <div className="episodes__episode-episode-title">{episodeData.name ?? ''}</div>
        </div>

        {daysToNewEpisode >= 0 && (
          <div className="episodes__episode-days-to-air">
            {willAirToday && authUser?.email === process.env.REACT_APP_ADMIN_EMAIL && (
              <TorrentLinksEpisodes
                showTitle={episodeData.show}
                seasonNumber={episodeData.season_number}
                episodeNumber={episodeData.episode_number}
              />
            )}
            <span>{handleDaysToNewEpisode()}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarEpisode
