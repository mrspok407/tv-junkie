import { useState, useEffect } from "react"

// const UserContentLocalStorageContext = createContext()

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = "watchingShowsLocalS"
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = "watchLaterMoviesLocalS"

const useUserContentLocalStorage = () => {
  const [userContent, setUserContent] = useState({
    watchingShows: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)) || [],
    watchLaterMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)) || []
  })

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS, JSON.stringify(userContent.watchingShows))
    localStorage.setItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES, JSON.stringify(userContent.watchLaterMovies))
  }, [userContent])

  useEffect(() => {
    console.log("ls mounted")
  }, [])

  const toggleMovieLS = ({ id, data = [] }) => {
    const movieExists = userContent.watchLaterMovies.find(item => item.id === id)
    const movie = Array.isArray(data) ? data.find(item => item.id === id) : data

    if (movieExists) {
      setUserContent(prevState => ({
        ...prevState,
        watchLaterMovies: [...prevState.watchLaterMovies.filter(item => item.id !== id)]
      }))
    } else {
      setUserContent(prevState => ({
        ...prevState,
        watchLaterMovies: [...userContent.watchLaterMovies, { ...movie, userWatching: movie && true }]
      }))
    }
  }

  const addShowLS = ({ id, data = [] }) => {
    if (userContent.watchingShows.find(item => item.id === id)) return
    const show = Array.isArray(data) ? data.find(item => item.id === id) : data

    setUserContent(prevState => ({
      ...prevState,
      watchingShows: [...userContent.watchingShows, { ...show, userWatching: show && true }]
    }))
  }

  const removeShowLS = ({ id }) => {
    setUserContent(prevState => ({
      ...prevState,
      watchingShows: [...prevState.watchingShows.filter(item => item.id !== id)]
    }))
  }

  const clearContentState = () => {
    setUserContent({ watchingShows: [], watchLaterMovies: [] })
  }

  return {
    ...userContent,
    toggleMovieLS,
    addShowLS,
    removeShowLS,
    clearContentState
  }
}

export default useUserContentLocalStorage

// const userContentLocalStorageProvider = Component => {
//   class UserContentLocalStorageProvider extends React.Component {
//     constructor(props) {
//       super(props)

//       this.state = {
//         watchingShows: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)) || [],
//         watchLaterMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)) || []
//       }
//     }

//     componentDidMount() {}

//     componentDidUpdate() {
//       localStorage.setItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS, JSON.stringify(this.state.watchingShows))
//       localStorage.setItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES, JSON.stringify(this.state.watchLaterMovies))
//     }

//     toggleMovieLS = ({ id, data = [] }) => {
//       const movieExists = this.state.watchLaterMovies.find(item => item.id === id)
//       const movie = Array.isArray(data) ? data.find(item => item.id === id) : data

//       if (movieExists) {
//         this.setState(prevState => ({
//           watchLaterMovies: [...prevState.watchLaterMovies.filter(item => item.id !== id)]
//         }))
//       } else {
//         this.setState({
//           watchLaterMovies: [...this.state.watchLaterMovies, { ...movie, userWatching: movie && true }]
//         })
//       }
//     }

//     addShowLS = ({ id, data = [] }) => {
//       if (this.state.watchingShows.find(item => item.id === id)) return

//       const show = Array.isArray(data) ? data.find(item => item.id === id) : data

//       this.setState({
//         watchingShows: [...this.state.watchingShows, { ...show, userWatching: show && true }]
//       })
//     }

//     removeShowLS = ({ id }) => {
//       this.setState(prevState => ({
//         watchingShows: [...prevState.watchingShows.filter(item => item.id !== id)]
//       }))
//     }

//     clearContentState = () => {
//       this.setState({
//         watchingShows: [],
//         watchLaterMovies: []
//       })
//     }

//     render() {
//       return (
//         <UserContentLocalStorageContext.Provider
//           value={{
//             ...this.state,
//             toggleMovieLS: this.toggleMovieLS,
//             addShowLS: this.addShowLS,
//             removeShowLS: this.removeShowLS,
//             clearContentState: this.clearContentState
//           }}
//         >
//           <Component {...this.props} />
//         </UserContentLocalStorageContext.Provider>
//       )
//     }
//   }
//   return UserContentLocalStorageProvider
// }

// export default userContentLocalStorageProvider

// import React, { createContext } from "react"

// export const UserContentLocalStorageContext = createContext()

// const LOCAL_STORAGE_KEY_WATCHING_SHOWS = "watchingShowsLocalS"
// const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = "watchLaterMoviesLocalS"

// const userContentLocalStorageProvider = Component => {
//   class UserContentLocalStorageProvider extends React.Component {
//     constructor(props) {
//       super(props)

//       this.state = {
//         watchingShows: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)) || [],
//         watchLaterMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)) || []
//       }
//     }

//     componentDidMount() {}

//     componentDidUpdate() {
//       localStorage.setItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS, JSON.stringify(this.state.watchingShows))
//       localStorage.setItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES, JSON.stringify(this.state.watchLaterMovies))
//     }

//     toggleMovieLS = ({ id, data = [] }) => {
//       const movieExists = this.state.watchLaterMovies.find(item => item.id === id)
//       const movie = Array.isArray(data) ? data.find(item => item.id === id) : data

//       if (movieExists) {
//         this.setState(prevState => ({
//           watchLaterMovies: [...prevState.watchLaterMovies.filter(item => item.id !== id)]
//         }))
//       } else {
//         this.setState({
//           watchLaterMovies: [...this.state.watchLaterMovies, { ...movie, userWatching: movie && true }]
//         })
//       }
//     }

//     addShowLS = ({ id, data = [] }) => {
//       if (this.state.watchingShows.find(item => item.id === id)) return

//       const show = Array.isArray(data) ? data.find(item => item.id === id) : data

//       this.setState({
//         watchingShows: [...this.state.watchingShows, { ...show, userWatching: show && true }]
//       })
//     }

//     removeShowLS = ({ id }) => {
//       this.setState(prevState => ({
//         watchingShows: [...prevState.watchingShows.filter(item => item.id !== id)]
//       }))
//     }

//     clearContentState = () => {
//       this.setState({
//         watchingShows: [],
//         watchLaterMovies: []
//       })
//     }

//     render() {
//       return (
//         <UserContentLocalStorageContext.Provider
//           value={{
//             ...this.state,
//             toggleMovieLS: this.toggleMovieLS,
//             addShowLS: this.addShowLS,
//             removeShowLS: this.removeShowLS,
//             clearContentState: this.clearContentState
//           }}
//         >
//           <Component {...this.props} />
//         </UserContentLocalStorageContext.Provider>
//       )
//     }
//   }
//   return UserContentLocalStorageProvider
// }

// export default userContentLocalStorageProvider
