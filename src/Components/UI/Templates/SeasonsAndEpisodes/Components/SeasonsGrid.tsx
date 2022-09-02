import React from 'react'
import classNames from 'classnames'
import { isArrayIncludes, currentDate, isContentReleasedValid } from 'Utils'
import { SeasonTMDB } from 'Utils/@TypesTMDB'
import Loader from 'Components/UI/Placeholders/Loader'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import { format } from 'date-fns'
import { FetchSeasonsInt } from '../Hooks/UseFetchSeasons/ReducerConfig/@Types'
import { ShowEpisodesFromAPIInt } from '../@Types'
import Season from './SeasonEpisodes/Season'

type Props = {
  showId: number
  showCheckboxes: boolean
  seasonsTMDB: SeasonTMDB[]
  seasonsData: FetchSeasonsInt<ShowEpisodesFromAPIInt>
  handleOpenSeasonEpisodes: (seasonId: number, seasonNum: number) => void
}

const SeasonsGrid: React.FC<Props> = ({
  showId,
  seasonsTMDB,
  seasonsData,
  showCheckboxes,
  handleOpenSeasonEpisodes,
}) => {
  const { data, loadingData, openData, errors } = seasonsData

  const renderEpisodes = (season: SeasonTMDB, isSeasonReleased: boolean) => {
    const seasonEpisodes = data.find((item) => item.seasonId === season.id)

    if (isArrayIncludes(season.id, loadingData)) {
      return <Loader className="loader--small-pink" />
    }

    if (isArrayIncludes(season.id, openData)) {
      return (
        <Season
          seasonTMDB={season}
          seasonEpisodes={seasonEpisodes}
          showCheckboxes={showCheckboxes}
          showId={showId}
          isSeasonAired={isSeasonReleased}
        />
      )
    }
  }

  const renderEdgeCases = (season: SeasonTMDB) => {
    return season.season_number === 0 || season.name === 'Specials' || season.episode_count === 0 || !season.id
  }

  return (
    <div className="episodes">
      {seasonsTMDB.map((season) => {
        if (renderEdgeCases(season)) return null

        const seasonDate = new Date(season.air_date ?? '')

        const daysToNewSeason = differenceInCalendarDays(seasonDate, currentDate)
        const [isSeasonReleased, isSeasonDateValid] = isContentReleasedValid(seasonDate)

        const renderSeasonDate = () => {
          if (isArrayIncludes(season.id, errors)) {
            return <div className="episodes__episode-group-days-to-air">Weird error occurred wow</div>
          }

          if (!isSeasonDateValid) {
            return (
              <div className="episodes__episode-group-date episodes__episode-group-date--no-date">
                No date available
              </div>
            )
          }

          if (!isSeasonReleased) {
            return (
              <div className="episodes__episode-group-days-to-air">
                {daysToNewSeason === 1 ? '1 day to air' : `${daysToNewSeason} days to air`}
              </div>
            )
          }

          return <div className="episodes__episode-group-date">{format(seasonDate, 'yyyy')}</div>
        }

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
                'episodes__episode-group-info--not-aired': !isSeasonReleased && isSeasonDateValid,
              })}
              onClick={() => handleOpenSeasonEpisodes(season.id, season.season_number)}
            >
              <div className="episodes__episode-group-name">Season {season.season_number}</div>
              {renderSeasonDate()}
            </div>

            {renderEpisodes(season, isSeasonReleased)}
          </div>
        )
      })}
    </div>
  )
}

export default SeasonsGrid
