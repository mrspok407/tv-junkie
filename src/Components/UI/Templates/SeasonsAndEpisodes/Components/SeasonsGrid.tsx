import classNames from 'classnames'
import UserRating from 'Components/UI/UserRating/UserRating'
import React from 'react'
import { differenceBtwDatesInDays, isArrayIncludes, todayDate } from 'Utils'
import { SeasonTMDB } from 'Utils/@TypesTMDB'
import { useAppSelector } from 'app/hooks'
import { selectShow } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import Loader from 'Components/UI/Placeholders/Loader'
import { FetchSeasonsInt } from '../Hooks/UseFetchSeasons/ReducerConfig/@Types'
import { ShowEpisodesFromAPIInterface } from '../@Types'

type Props = {
  showId: number
  showCheckboxes: boolean
  seasonsTMDB: SeasonTMDB[]
  gridState: FetchSeasonsInt<ShowEpisodesFromAPIInterface>
  handleOpenSeasonEpisodes: (seasonId: number, seasonNum: number) => void
}

const SeasonsGrid: React.FC<Props> = ({ showId, seasonsTMDB, gridState, showCheckboxes, handleOpenSeasonEpisodes }) => {
  const showInfoStore = useAppSelector((state) => selectShow(state, showId))
  const { data, loadingData, openData, errors } = gridState

  console.log({ seasonsTMDB })
  const renderEdgeCase = (season: SeasonTMDB) => {
    return season.season_number === 0 || season.name === 'Specials' || season.episode_count === 0 || !season.id
  }

  const renderEpisodes = (season: SeasonTMDB, daysToNewSeason: number) => {
    if (isArrayIncludes(season.id, loadingData)) {
      return <Loader className="loader--small-pink" />
    }

    if (isArrayIncludes(season.id, openData)) {
      return (
        <>
          {season.poster_path && (
            <div className="episodes__episode-group-poster-wrapper">
              {daysToNewSeason <= 0 && (
                <UserRating
                  id={showId}
                  firebaseRef="userShowSeason"
                  seasonNum={season.season_number}
                  disableRating={!!(showInfoStore?.database === 'notWatchingShows')}
                />
              )}

              <div
                className="episodes__episode-group-poster"
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/w500/${season.poster_path})`,
                }}
              />
              {showCheckboxes && daysToNewSeason <= 0 && (
                <div className="episodes__episode-group-check-all-episodes">
                  <button
                    type="button"
                    className="button"
                    // onClick={() => checkEverySeasonEpisode(season.season_number)}
                  >
                    Check all
                  </button>
                </div>
              )}
            </div>
          )}
          {/* <SeasonEpisodes
          episodesData={seasonsTMDB}
          episodesDataFromAPI={data}
          showTitle={showTitle}
          season={season}
          seasonId={season.id}
          episodesFromDatabase={episodesFromDatabase}
          showInfo={showInfoStore}
          toggleWatchedEpisode={toggleWatchedEpisode}
          checkMultipleEpisodes={checkMultipleEpisodes}
        /> */}
        </>
      )
    }
  }

  return (
    <div className="episodes">
      {seasonsTMDB.map((season) => {
        if (renderEdgeCase(season)) return null

        const daysToNewSeason = differenceBtwDatesInDays(season.air_date, todayDate)
        return (
          <div
            key={season.id}
            className={classNames('episodes__episode-group', {
              'episodes__episode-group--no-poster': !season.poster_path,
            })}
            style={!isArrayIncludes(season.id, loadingData) ? { rowGap: '10px' } : { rowGap: '0px' }}
          >
            <div
              className={classNames('episodes__episode-group-info', {
                'episodes__episode-group-info--open': isArrayIncludes(season.id, openData),
                'episodes__episode-group-info--error': isArrayIncludes(season.id, errors),
                'episodes__episode-group-info--not-aired': daysToNewSeason > 0,
              })}
              onClick={() => handleOpenSeasonEpisodes(season.id, season.season_number)}
            >
              <div className="episodes__episode-group-name">Season {season.season_number}</div>

              {isArrayIncludes(season.id, errors) ? (
                <div className="episodes__episode-group-days-to-air">Weird error occured wow</div>
              ) : (
                daysToNewSeason > 0 && (
                  <div className="episodes__episode-group-days-to-air">{daysToNewSeason} days to air</div>
                )
              )}
              <div className="episodes__episode-group-date">{season.air_date && season.air_date.slice(0, 4)}</div>
            </div>

            {renderEpisodes(season, daysToNewSeason)}
          </div>
        )
      })}
    </div>
  )
}

export default SeasonsGrid
