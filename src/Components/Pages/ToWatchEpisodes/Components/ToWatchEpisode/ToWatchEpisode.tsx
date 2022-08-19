import React, { useEffect } from 'react'
import { useAppSelector } from 'app/hooks'
import EpisodeCheckbox from 'Components/UI/Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/Components/Episode/Components/EpisodeCheckbox/EpisodeCheckbox'
import { SingleEpisodeStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleEpisode } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { differenceInCalendarDays, format } from 'date-fns'
import { currentDate } from 'Utils'
import UserRatingEpisode from 'Components/UI/Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/Components/Episode/Components/UserRatingEpisode'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import classNames from 'classnames'
import TorrentLinsToWatchPage from './Components/TorrentLinksToWatchPage'

type Props = {
  episodeData: SingleEpisodeStoreState
  showId: number
  episodesListRef: React.MutableRefObject<HTMLDivElement>
  handleEpisodeCheck: (data: any) => void
}

const ToWatchEpisode: React.FC<Props> = ({ episodeData, showId, episodesListRef, handleEpisodeCheck }) => {
  const { authUser } = useFrequentVariables()
  const isWatched = useAppSelector((state) => {
    const episode = selectSingleEpisode(state, showId, episodeData.season_number, episodeData.episode_number)
    return episode?.watched ?? false
  })

  const airDateReadable = episodeData.air_date
    ? format(new Date(episodeData.air_date), 'MMMM d, yyyy')
    : 'No date available'

  const showTorrentLinks = authUser?.email === process.env.REACT_APP_ADMIN_EMAIL

  if (isWatched || differenceInCalendarDays(new Date(episodeData.air_date), currentDate) > 0) return null

  return (
    <div className="episodes__episode" data-episodenumber={episodeData.episode_number} data-id={episodeData.id}>
      <div
        className={classNames('episodes__episode-wrapper', {
          'episodes__episode-wrapper--torrent-links': showTorrentLinks,
        })}
      >
        <EpisodeCheckbox
          isDisabled={false}
          episodeData={episodeData}
          showId={showId}
          handleEpisodeCheck={handleEpisodeCheck}
        />

        <UserRatingEpisode
          showRating
          showId={showId}
          episodeNumber={episodeData.episode_number}
          seasonNumber={episodeData.season_number}
          isToWatchPage
        />
        <div className="episodes__episode-date">{airDateReadable}</div>
        <div className="episodes__episode-name">
          <span className="episodes__episode-number">{episodeData.episode_number}.</span>
          {episodeData.name}
        </div>

        {showTorrentLinks && (
          <TorrentLinsToWatchPage
            showId={showId}
            seasonNumber={episodeData.season_number}
            episodeNumber={episodeData.episode_number}
          />
        )}
      </div>
    </div>
  )
}

export default ToWatchEpisode
