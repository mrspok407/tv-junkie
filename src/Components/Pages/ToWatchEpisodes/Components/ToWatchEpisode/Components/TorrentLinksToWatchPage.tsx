import React from 'react'
import { useAppSelector } from 'app/hooks'
import TorrentLinksEpisodes from 'Components/UI/Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/Components/TorrentLinksEpisodes/TorrentLinksEpisodes'
import { selectShow } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'

type Props = {
  showId: number
  seasonNumber: number
  episodeNumber: number
}

const TorrentLinsToWatchPage: React.FC<Props> = ({ showId, seasonNumber, episodeNumber }) => {
  const showTitle = useAppSelector((state) => selectShow(state, showId)?.name) ?? ''
  return (
    <TorrentLinksEpisodes
      parentComponent="toWatchPage"
      showTitle={showTitle}
      seasonNumber={seasonNumber}
      episodeNumber={episodeNumber}
    />
  )
}

export default TorrentLinsToWatchPage
