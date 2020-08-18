import React, { createContext } from "react"

export const UserContentLocalStorageContext = createContext()

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = "watchingShowsLocalS"
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = "watchLaterMoviesLocalS"

const userContentLocalStorageProvider = Component => {
  class UserContentLocalStorageProvider extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        watchingShows: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)) || [],
        watchLaterMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)) || []
      }
    }

    componentDidUpdate() {
      localStorage.setItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS, JSON.stringify(this.state.watchingShows))
      localStorage.setItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES, JSON.stringify(this.state.watchLaterMovies))
    }

    toggleMovieLS = ({ id, data = [] }) => {
      const movieExists = this.state.watchLaterMovies.find(item => item.id === id)
      const movie = Array.isArray(data) ? data.find(item => item.id === id) : data

      if (movieExists) {
        this.setState(prevState => ({
          watchLaterMovies: [...prevState.watchLaterMovies.filter(item => item.id !== id)]
        }))
      } else {
        this.setState({
          watchLaterMovies: [...this.state.watchLaterMovies, { ...movie, userWatching: movie && true }]
        })
      }
    }

    addShowLS = ({ id, data = [] }) => {
      if (this.state.watchingShows.find(item => item.id === id)) return

      const show = Array.isArray(data) ? data.find(item => item.id === id) : data

      this.setState({
        watchingShows: [...this.state.watchingShows, { ...show, userWatching: show && true }]
      })
    }

    removeShowLS = ({ id }) => {
      this.setState(prevState => ({
        watchingShows: [...prevState.watchingShows.filter(item => item.id !== id)]
      }))
    }

    clearContentState = () => {
      this.setState({
        watchingShows: [],
        watchLaterMovies: []
      })
    }

    render() {
      return (
        <UserContentLocalStorageContext.Provider
          value={{
            ...this.state,
            toggleMovieLS: this.toggleMovieLS,
            addShowLS: this.addShowLS,
            removeShowLS: this.removeShowLS,
            clearContentState: this.clearContentState
          }}
        >
          <Component {...this.props} />
        </UserContentLocalStorageContext.Provider>
      )
    }
  }
  return UserContentLocalStorageProvider
}

export default userContentLocalStorageProvider
