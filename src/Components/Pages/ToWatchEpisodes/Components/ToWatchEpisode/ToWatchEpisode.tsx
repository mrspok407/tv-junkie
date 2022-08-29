import React from 'react'
import EpisodeCheckbox from 'Components/UI/Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/Components/Episode/Components/EpisodeCheckbox/EpisodeCheckbox'
import { SingleEpisodeStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { format, isValid } from 'date-fns'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import classNames from 'classnames'
import TorrentLinsToWatchPage from './Components/TorrentLinksToWatchPage'
import useHandleEpisodeCheck from './Hooks/UseHandleEpisodeCheck'
import UserRatingEpisodeToWatch from './Components/UserRatingEpisodeToWatch'
import useShouldToWatchEpisodeRender from './Hooks/UseShouldToWatchEpisodeRender'

type Props = {
  episodeData: SingleEpisodeStoreState
  showId: number
  episodesListRef: React.MutableRefObject<HTMLDivElement>
  seasonsListRef: React.MutableRefObject<HTMLDivElement>
  showsListRef: React.MutableRefObject<HTMLDivElement>
  checkAllButtonRef: React.MutableRefObject<HTMLDivElement>
  isCheckEpisodeAnimationRunning: React.MutableRefObject<boolean>
  showIndex: number
}

const ToWatchEpisode: React.FC<Props> = ({
  episodeData,
  showId,
  showsListRef,
  seasonsListRef,
  episodesListRef,
  checkAllButtonRef,
  isCheckEpisodeAnimationRunning,
  showIndex,
}) => {
  const { authUser } = useFrequentVariables()

  const episodeReleaseDate = new Date(episodeData.air_date ?? '')
  const airDateReadable = isValid(episodeReleaseDate) ? format(episodeReleaseDate, 'MMMM d, yyyy') : 'No date available'

  const handleEpisodeCheck = useHandleEpisodeCheck({
    episodeData,
    showsListRef,
    seasonsListRef,
    episodesListRef,
    checkAllButtonRef,
    isCheckEpisodeAnimationRunning,
    showIndex,
    showId,
  })

  const shouldEpisodeRender = useShouldToWatchEpisodeRender({ episodeData, showId })
  if (!shouldEpisodeRender) return null

  const showTorrentLinks = authUser?.email === process.env.REACT_APP_ADMIN_EMAIL
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

        <UserRatingEpisodeToWatch handleEpisodeCheck={handleEpisodeCheck} />

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
