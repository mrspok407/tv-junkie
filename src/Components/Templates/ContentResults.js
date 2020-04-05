import React, { useContext } from "react"
import { listOfGenres } from "../../Utils"
import { SelectedContentContext } from "../Context/SelectedContentContext"

export default function ContentResults({ contentArr, toggleContentArr }) {
  const { selectedContent, toggleContent } = useContext(SelectedContentContext)

  return (
    <div className="content-results__wrapper">
      {contentArr.map(
        ({
          original_title,
          original_name,
          id,
          release_date,
          first_air_date,
          vote_average,
          genre_ids,
          overview,
          backdrop_path,
          poster_path,
          vote_count
        }) => {
          const filteredGenres = genre_ids.map(genreId =>
            listOfGenres.filter(item => item.id === genreId)
          )

          const title = original_title || original_name
          const date = release_date || first_air_date
          return (
            <div key={id} className="content-results__item">
              <div className="content-results__item-main-info">
                <div className="content-results__item-title">
                  {!title ? "No title available" : title}
                </div>
                <div className="content-results__item-year">
                  ({!date ? "No data" : date.slice(0, 4)})
                </div>
                <div className="content-results__item-rating">
                  {vote_average}
                  <span>/10</span>
                  <span className="content-results__item-rating-vote-count">
                    ({vote_count})
                  </span>
                </div>
              </div>
              <div className="content-results__item-genres">
                {filteredGenres.map(item => (
                  <span key={item[0].id}>{item[0].name}</span>
                ))}
              </div>
              <div className="content-results__item-overview">
                <div className="content-results__item-poster">
                  <div
                    style={
                      backdrop_path !== null
                        ? {
                            backgroundImage: `url(https://image.tmdb.org/t/p/w500/${backdrop_path ||
                              poster_path})`
                          }
                        : {
                            backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
                          }
                    }
                  />
                </div>
                <div className="content-results__item-description">
                  {overview.length > 150
                    ? `${overview.substring(0, 150)}...`
                    : overview}
                </div>
              </div>
              {selectedContent.some(e => e.id === id) ? (
                <button
                  className="button button--content-results button--pressed"
                  onClick={() => toggleContent(id, toggleContentArr)}
                  type="button"
                >
                  Remove {original_title ? "movie" : "show"}
                </button>
              ) : (
                <button
                  className="button button--content-results"
                  onClick={() => toggleContent(id, toggleContentArr)}
                  type="button"
                >
                  Add {original_title ? "movie" : "show"}
                </button>
              )}
            </div>
          )
        }
      )}
    </div>
  )
}
