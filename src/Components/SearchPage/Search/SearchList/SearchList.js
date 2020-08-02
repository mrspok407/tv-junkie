/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { Component } from "react"
import SearchCard from "./SearchCard"
import "./SearchList.scss"

export default class SearchList extends Component {
  componentDidMount() {
    document.addEventListener("mousedown", this.props.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.props.handleClickOutside)
  }

  render() {
    return (
      <div ref={this.searchList} className="search-list">
        {this.props.searchResults.map(
          (
            {
              title = "",
              original_title = "",
              name = "",
              original_name = "",
              vote_average = "",
              first_air_date = "",
              release_date = "",
              origin_country = [],
              original_language = "",
              poster_path = "",
              profile_path = "",
              backdrop_path = "",
              overview = "",
              id,
              media_type = "",
              known_for,
              known_for_department
            },
            index
          ) => {
            return (
              <SearchCard
                key={id}
                movieTitle={title || original_title}
                showTitle={name || original_name}
                releaseDate={first_air_date || release_date}
                voteAverage={vote_average}
                originCountry={origin_country}
                originalLanguage={original_language}
                personName={name}
                poster={poster_path}
                personImage={profile_path}
                posterBackdrop={backdrop_path}
                overview={overview}
                id={id}
                closeList={this.props.closeList}
                currentListItem={this.props.currentListItem}
                known_for={known_for}
                known_for_department={known_for_department}
                searchResults={this.props.searchResults}
                index={index}
                contentInDatabase={this.props.contentInDatabase}
                updateContentInDbClient={this.props.updateContentInDbClient}
                mediaType={media_type}
                mediaTypeSearching={this.props.mediaTypeSearching}
                toggleCurrentlyChosenContent={this.props.toggleCurrentlyChosenContent}
                currentlyChosenContent={this.props.currentlyChosenContent}
              />
            )
          }
        )}
      </div>
    )
  }
}
