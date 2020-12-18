import React from "react"
import classNames from "classnames"
import "./TorrentLinksEpisodes.scss"

type Props = {
  parentComponent?: string
  showTitle: string
  seasonNumber: number
  episodeNumber: number
}

const TorrentLinksEpisodes = React.memo<Props>(
  ({ parentComponent = "", showTitle, seasonNumber, episodeNumber }) => {
    const urlShowTitle = showTitle.split(" ").join("+")

    const seasonToString = seasonNumber.toString()
    const episodeToString = episodeNumber.toString()
    const urlSeasonNumber =
      seasonToString.length === 1 ? "s0".concat(seasonToString) : "s".concat(seasonToString)
    const urlEpisodeNumber =
      episodeToString.length === 1 ? "e0".concat(episodeToString) : "e".concat(episodeToString)
    return (
      <div
        className={classNames("torrent-links torrent-links--episodes", {
          "torrent-links--to-watch-page": parentComponent === "toWatchPage"
        })}
      >
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.ettvdl.com/torrents-search.php?search=${urlShowTitle}+${urlSeasonNumber}${urlEpisodeNumber}+1080p&cat=41`}
        >
          1080p
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.ettvdl.com/torrents-search.php?search=${urlShowTitle}+${urlSeasonNumber}${urlEpisodeNumber}+720p&cat=41`}
        >
          720p
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.ettvdl.com/torrents-search.php?search=${urlShowTitle}+${urlSeasonNumber}${urlEpisodeNumber}&cat=5`}
        >
          480p
        </a>
      </div>
    )
  }
)

export default TorrentLinksEpisodes
