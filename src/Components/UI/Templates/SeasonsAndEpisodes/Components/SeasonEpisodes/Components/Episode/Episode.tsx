import React, { useState } from 'react'
import classNames from 'classnames'
import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useFormatEpisodeAirDate from '../../../../Hooks/UseFormatEpisodeAirDate'
import TorrentLinksEpisodes from '../TorrentLinksEpisodes/TorrentLinksEpisodes'
import UserRatingEpisode from './Components/UserRatingEpisode'
import EpisodeCheckbox from './Components/EpisodeCheckbox/EpisodeCheckbox'

type Props = {
  episodeData: SingleEpisodeFromFireDatabase
  showCheckboxes: boolean
  showId: number
  showTitle: string
}

const Episode: React.FC<Props> = ({ episodeData, showCheckboxes, showId, showTitle }) => {
  const { authUser } = useFrequentVariables()
  const [isEpisodeOpen, setIsEpisodeOpen] = useState(false)

  const [airDateReadable, daysToNewEpisode, isEpisodeAired, airDateUnavailable] = useFormatEpisodeAirDate({
    episodeData,
  })

  return (
    <div
      className={classNames('episodes__episode', {
        'episodes__episode--open': isEpisodeOpen,
      })}
    >
      <div
        className={classNames('episodes__episode-wrapper', {
          'episodes__episode-wrapper--not-aired': !isEpisodeAired || airDateUnavailable,
        })}
        onClick={() => setIsEpisodeOpen(!isEpisodeOpen)}
      >
        {isEpisodeAired && !airDateUnavailable && (
          <EpisodeCheckbox isDisabled={!showCheckboxes || !authUser?.uid} episodeData={episodeData} showId={showId} />
        )}

        <div className="episodes__episode-date">{airDateReadable}</div>
        <div className="episodes__episode-name">
          <span className="episodes__episode-number">{episodeData.episode_number}.</span>
          {episodeData.name}
        </div>
        {!isEpisodeAired && (
          <div className="episodes__episode-days-to-air">
            {daysToNewEpisode === 1 ? `${daysToNewEpisode} day` : `${daysToNewEpisode} days`}
          </div>
        )}
      </div>

      {isEpisodeOpen && (
        <div
          className={classNames('episodes__episode-detailes', {
            'episodes__episode-detailes--no-image': !episodeData.still_path,
          })}
        >
          {episodeData.still_path && (
            <div
              className="episodes__episode-detailes-image"
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w500${episodeData.still_path})`,
              }}
            />
          )}
          {episodeData.overview && <div className="episodes__episode-detailes-overview">{episodeData.overview}</div>}

          {isEpisodeAired && !airDateUnavailable && (
            <>
              <UserRatingEpisode
                showRating={showCheckboxes}
                seasonNumber={episodeData.season_number}
                episodeNumber={episodeData.episode_number}
                showId={showId}
              />
              {authUser?.email !== process.env.REACT_APP_ADMIN_EMAIL && (
                <TorrentLinksEpisodes
                  showTitle={showTitle}
                  seasonNumber={episodeData.season_number}
                  episodeNumber={episodeData.episode_number as number}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Episode
