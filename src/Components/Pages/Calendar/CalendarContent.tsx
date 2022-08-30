import React, { useMemo } from 'react'
import Loader from 'Components/UI/Placeholders/Loader'
import PlaceholderNoFutureEpisodes from 'Components/UI/Placeholders/PlaceholderNoFutureEpisodes'
import { useAppSelector } from 'app/hooks'
import {
  selectEpisodes,
  selectShows,
  selectShowsLoading,
} from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { ShowFullDataStoreState, UserWillAirEpisodesInterface } from 'Components/UserContent/UseUserShowsRed/@Types'
import useAppSelectorArray from 'Utils/Hooks/UseAppSelectorArray'
import { organizeFutureEpisodesByMonth } from './CalendarHelpers'
import MonthEpisodes from './Components/MonthEpisodes/MonthEpisodes'

type Props = {
  homePage?: boolean
}

const CalendarContent: React.FC<Props> = ({ homePage }) => {
  const showsInitialLoading = useAppSelector(selectShowsLoading)

  const userShows = useAppSelectorArray<ShowFullDataStoreState>(selectShows)
  const userEpisodes = useAppSelector(selectEpisodes)

  const willAirEpisodesData: UserWillAirEpisodesInterface[] = useMemo(() => {
    const watchingShows = userShows.filter((show) => show?.database === 'watchingShows')
    return organizeFutureEpisodesByMonth(watchingShows, userEpisodes)
  }, [userShows, userEpisodes])

  const willAirEpisodes = homePage ? willAirEpisodesData.slice(0, 2) : willAirEpisodesData

  if (showsInitialLoading) {
    return (
      <div className="content-results content-results--calendar">
        <Loader className="loader--pink" />
      </div>
    )
  }

  if (willAirEpisodes.length === 0 && !homePage) {
    return (
      <div className="content-results content-results--calendar">
        <PlaceholderNoFutureEpisodes />
      </div>
    )
  }

  return (
    <div className="content-results content-results--calendar">
      <div className="episodes episodes--calendar">
        {willAirEpisodes.map((monthEpisodesData, index) => {
          let isMonthOpen = !homePage
          if (homePage && index === 0) {
            isMonthOpen = true
          }
          return (
            <MonthEpisodes
              key={monthEpisodesData.month}
              monthEpisodesData={monthEpisodesData}
              isMonthOpen={isMonthOpen}
            />
          )
        })}
      </div>
    </div>
  )
}

export default CalendarContent
