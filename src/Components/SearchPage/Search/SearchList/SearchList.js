/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { Component } from "react"
import SearchCard from "./SearchCard"
import "./SearchList.scss"

export default class MovieList extends Component {
  componentDidMount() {
    document.addEventListener("mousedown", this.props.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.props.handleClickOutside)
  }

  render() {
    const { searchResults, mediaTypeSearching } = this.props
    return searchResults.map(
      ({
        title = "",
        original_title = "",
        name = "",
        original_name = "",
        poster_path = "",
        profile_path = "",
        backdrop_path = "",
        overview = "",
        id,
        media_type = "",
        known_for,
        known_for_department
      }) => {
        return (
          <SearchCard
            key={id}
            movieTitle={title || original_title}
            showTitle={name || original_name}
            personName={name}
            poster={poster_path}
            personImage={profile_path}
            posterBackdrop={backdrop_path}
            overview={overview}
            id={id}
            known_for={known_for}
            known_for_department={known_for_department}
            searchResults={searchResults}
            contentInDatabase={this.props.contentInDatabase}
            updateContentInDbClient={this.props.updateContentInDbClient}
            mediaType={media_type}
            mediaTypeSearching={mediaTypeSearching}
            toggleCurrentlyChosenContent={this.props.toggleCurrentlyChosenContent}
            currentlyChosenContent={this.props.currentlyChosenContent}
          />
        )
      }
    )
  }
}
