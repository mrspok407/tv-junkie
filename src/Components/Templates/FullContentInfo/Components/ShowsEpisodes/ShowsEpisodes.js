import React, { Component } from "react"
import { withUserContent } from "Components/UserContent"
import axios, { CancelToken } from "axios"
import ShowsEpisodesAuthUser from "./ShowsEpisodesAuthUser"
import ShowsEpisodesNotAuthUser from "./ShowsEpisodesNotAuthUser"

let cancelRequest

class ShowsEpisodes extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loadingEpisodesIds: [],
      openSeasons: [],
      showEpisodes: [],
      detailEpisodeInfo: [],
      errorShowEpisodes: ""
    }
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
  }

  showSeasonsEpisode = (seasonId, seasonNum) => {
    if (this.state.openSeasons.includes(seasonId)) {
      this.setState(prevState => ({
        openSeasons: [...prevState.openSeasons.filter(item => item !== seasonId)]
      }))
    } else {
      this.setState(prevState => ({
        openSeasons: [...prevState.openSeasons, seasonId]
      }))
    }

    if (this.state.showEpisodes.some(item => item.seasonId === seasonId)) return

    this.setState(prevState => ({
      loadingEpisodesIds: [...prevState.loadingEpisodesIds, seasonId]
    }))

    axios
      .get(
        `https://api.themoviedb.org/3/tv/${this.props.id}/season/${seasonNum}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
      .then(({ data: { episodes } }) => {
        if (!this._isMounted) return

        const episodesReverse = episodes.reverse()

        this.setState(prevState => ({
          showEpisodes: [...prevState.showEpisodes, { seasonId, episodes: episodesReverse }],
          loadingEpisodesIds: [...prevState.loadingEpisodesIds.filter(item => item !== seasonId)],
          errorShowEpisodes: ""
        }))
      })
      .catch(err => {
        if (axios.isCancel(err) || !this._isMounted) return
        this.setState({
          loadingEpisodesIds: [],
          errorShowEpisodes: "Something went wrong, sorry"
        })
      })
  }

  showEpisodeInfo = episodeId => {
    if (this.state.detailEpisodeInfo.includes(episodeId)) {
      this.setState(prevState => ({
        detailEpisodeInfo: [...prevState.detailEpisodeInfo.filter(item => item !== episodeId)]
      }))
    } else {
      this.setState(prevState => ({
        detailEpisodeInfo: [...prevState.detailEpisodeInfo, episodeId]
      }))
    }
  }

  showSeasonsEpisodeAuthUser = seasonId => {
    if (this.state.openSeasons.includes(seasonId)) {
      this.setState(prevState => ({
        openSeasons: [...prevState.openSeasons.filter(item => item !== seasonId)]
      }))
    } else {
      this.setState(prevState => ({
        openSeasons: [...prevState.openSeasons, seasonId]
      }))
    }
  }

  toggleWatchedEpisode = (showId, seasonNum, episodeNum) => {
    const watchingShows = this.props.userContent.watchingShows
    const show = watchingShows.find(item => item.id === Number(showId)) || {}
    const showEpisode = show.episodes[seasonNum - 1][episodeNum - 1]

    this.props.firebase
      .watchingShowsEpisode(this.props.authUser.uid, show.key, seasonNum - 1, episodeNum - 1)
      .update({ watched: !showEpisode.watched })
  }

  checkEverySeasonEpisode = seasonNum => {
    const show = this.props.userContent.watchingShows.find(item => item.id === Number(this.props.id)) || {}
    const isAllEpisodesChecked = !show.episodes[seasonNum - 1].some(item => item.watched === false)

    show.episodes[seasonNum - 1].forEach((episode, index) => {
      show.episodes[seasonNum - 1][index].watched = !isAllEpisodesChecked
    })

    this.props.firebase
      .watchingShowsAllSeasonEpisodes(this.props.authUser.uid, show.key, seasonNum - 1)
      .set(show.episodes[seasonNum - 1])
  }

  checkEveryShowEpisode = () => {
    const show = this.props.userContent.watchingShows.find(item => item.id === Number(this.props.id)) || {}
    let isAllEpisodesChecked

    show.episodes.forEach(item => (isAllEpisodesChecked = !item.some(item => item.watched === false)))

    show.episodes.forEach((season, indexSeason) => {
      season.forEach((episode, indexEpisode) => {
        show.episodes[indexSeason][indexEpisode].watched = !isAllEpisodesChecked
      })
    })

    this.props.firebase.watchingShowsAllEpisodes(this.props.authUser.uid, show.key).set(show.episodes)
  }

  render() {
    const showInDb = this.props.userContent.watchingShows.find(item => item.id === Number(this.props.id))

    return (
      <>
        {showInDb ? (
          <ShowsEpisodesAuthUser
            openSeasons={this.state.openSeasons}
            detailEpisodeInfo={this.state.detailEpisodeInfo}
            showEpisodeInfo={this.showEpisodeInfo}
            toggleWatchedEpisode={this.toggleWatchedEpisode}
            checkEverySeasonEpisode={this.checkEverySeasonEpisode}
            checkEveryShowEpisode={this.checkEveryShowEpisode}
            showSeasonsEpisodeAuthUser={this.showSeasonsEpisodeAuthUser}
            showEpisodes={this.state.showEpisodes}
            showInDb={showInDb}
            seasonsArr={this.props.seasonsArr}
            showTitle={this.props.showTitle}
            todayDate={this.props.todayDate}
            id={this.props.id}
          />
        ) : (
          <ShowsEpisodesNotAuthUser
            openSeasons={this.state.openSeasons}
            detailEpisodeInfo={this.state.detailEpisodeInfo}
            loadingEpisodesIds={this.state.loadingEpisodesIds}
            showEpisodes={this.state.showEpisodes}
            errorShowEpisodes={this.state.errorShowEpisodes}
            showEpisodeInfo={this.showEpisodeInfo}
            showSeasonsEpisode={this.showSeasonsEpisode}
            seasonsArr={this.props.seasonsArr}
            showTitle={this.props.showTitle}
            todayDate={this.props.todayDate}
            id={this.props.id}
          />
        )}
      </>
    )
  }
}

export default withUserContent(ShowsEpisodes, "ShowsEpisodes")
