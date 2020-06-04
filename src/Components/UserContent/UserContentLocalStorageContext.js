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
        watchLaterMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)) || [],
        toggleContentLS: this.toggleContentLS,
        clearContentState: this.clearContentState
      }
    }

    componentDidUpdate() {
      localStorage.setItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS, JSON.stringify(this.state.watchingShows))
      localStorage.setItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES, JSON.stringify(this.state.watchLaterMovies))
    }

    toggleContentLS = (id, type, contentArr) => {
      console.log(id)
      const contentExists = this.state[type].find(item => item.id === id)
      const newContent = contentArr && contentArr.find(item => item.id === id)

      if (contentExists) {
        this.setState(prevState => ({
          [type]: [...prevState[type].filter(item => item.id !== id)]
        }))
      } else {
        this.setState(prevState => ({
          [type]: [...prevState[type], { ...newContent, userWatching: newContent && true }]
        }))
      }
    }

    clearContentState = () => {
      this.setState({
        watchingShows: [],
        watchLaterMovies: []
      })
    }

    render() {
      return (
        <UserContentLocalStorageContext.Provider value={this.state}>
          <Component {...this.props} />
        </UserContentLocalStorageContext.Provider>
      )
    }
  }
  return UserContentLocalStorageProvider
}

export default userContentLocalStorageProvider
