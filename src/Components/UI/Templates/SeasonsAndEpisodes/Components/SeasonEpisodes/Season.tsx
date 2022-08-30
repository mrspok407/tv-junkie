import { useAppDispatch } from 'app/hooks'
import { postCheckReleasedEpisodes } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/PostData/postShowEpisodesData'
import React from 'react'
import { SeasonTMDB } from 'Utils/@TypesTMDB'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { ShowEpisodesFromAPIInt } from '../../@Types'
import Episode from './Components/Episode/Episode'
import UserRatingSeason from './Components/UserRatingSeason'

type Props = {
  isSeasonAired: boolean
  seasonEpisodes: ShowEpisodesFromAPIInt | undefined
  seasonTMDB: SeasonTMDB
  showCheckboxes: boolean
  showId: number
}

const Season: React.FC<Props> = React.memo(({ seasonTMDB, seasonEpisodes, showCheckboxes, isSeasonAired, showId }) => {
  const { firebase } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const seasonData = {
    ...seasonTMDB,
    episodes: seasonEpisodes?.episodes || [],
    showTitle: seasonEpisodes?.showTitle || '',
  }

  const seasonIndex = seasonData.season_number - 1
  return (
    <>
      {seasonData.poster_path && (
        <div className="episodes__episode-group-poster-wrapper">
          {isSeasonAired && (
            <UserRatingSeason showRating={showCheckboxes} seasonNumber={seasonData.season_number} showId={showId} />
          )}

          <div
            className="episodes__episode-group-poster"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/w500/${seasonData.poster_path})`,
            }}
          />
          {showCheckboxes && isSeasonAired && (
            <div className="episodes__episode-group-check-all-episodes">
              <button
                type="button"
                className="button"
                onClick={() => {
                  dispatch(postCheckReleasedEpisodes({ showId, seasonNumber: seasonIndex, firebase }))
                }}
              >
                Check all
              </button>
            </div>
          )}
        </div>
      )}

      <div className="episodes__episode-list">
        {seasonData.episodes.map((episode) => {
          return (
            <Episode
              key={episode.id}
              episodeData={episode}
              showCheckboxes={showCheckboxes}
              showId={showId}
              showTitle={seasonData.showTitle}
            />
          )
        })}
      </div>
    </>
  )
})

export default Season
