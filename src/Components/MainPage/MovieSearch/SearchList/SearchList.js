/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { Component } from "react"
import SearchCard from "./SearchCard"
import "./SearchList.scss"

export default class MovieList extends Component {
  // state = { movieCardHovered: false, movieCardId: "" }

  componentDidMount() {
    document.addEventListener("mousedown", this.props.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.props.handleClickOutside)
  }

  render() {
    const { searchResults, toggleMovie, selectedMovies } = this.props
    return searchResults.map(
      ({
        original_title,
        name = "",
        poster_path = "",
        profile_path = "",
        overview = "",
        id,
        known_for,
        known_for_department
      }) => {
        const isMovie = !!overview
        return (
          <SearchCard
            key={id}
            original_title={original_title}
            name={name}
            poster_path={poster_path}
            profile_path={profile_path}
            overview={overview}
            id={id}
            known_for={known_for}
            known_for_department={known_for_department}
            searchResults={searchResults}
            toggleMovie={toggleMovie}
            selectedMovies={selectedMovies}
            isMovie={isMovie}
          />
        )
      }
    )
  }
}
