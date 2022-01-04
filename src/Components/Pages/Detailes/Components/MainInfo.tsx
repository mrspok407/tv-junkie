import React, { useContext } from "react"
import ShowsButtonsRed from "./ShowsButtonsRed"
import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import UserRating from "Components/UI/UserRating/UserRating"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"

type Props = {
  detailes: ContentDetailes
  movieInDatabase?: {} | null
  mediaType: string
  id: number
}

export const MainInfo: React.FC<Props> = ({ detailes, mediaType, id }) => {
  const context = useContext(AppContext)
  const { authUser } = context

  const movieInLS = context.userContentLocalStorage.watchLaterMovies.find(
    (item: { id: number }) => item.id === Number(id)
  )

  const isMediaTypeTV = mediaType === "show"
  const title = isMediaTypeTV ? detailes.name : detailes.title
  const yearRelease = isMediaTypeTV ? detailes.first_air_date.slice(0, 4) : detailes.release_date.slice(0, 4)
  const yearEnded = isMediaTypeTV && detailes.last_air_date.slice(0, 4)

  const yearRange =
    detailes.status === "Ended" || detailes.status === "Canceled"
      ? `${yearRelease} - ${yearEnded}`
      : `${yearRelease} - ...`

  const runtime = isMediaTypeTV ? detailes.episode_run_time[0] : detailes.runtime

  const formatedBudget =
    detailes.budget !== 0 ? (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      })
        .format(detailes.budget)
        .slice(0, -3)
        .split(",")
        .join(".")
    ) : (
      <span className="detailes-page__info-no-info">-</span>
    )

  return (
    <div className="detailes-page__info">
      <div className="detailes-page__info-title">
        {title}
        <span>{isMediaTypeTV && yearRelease !== "-" ? ` (${yearRange})` : ""}</span>
      </div>
      <div className="detailes-page__info-row">
        <div className="detailes-page__info-option">Year</div>
        <div className="detailes-page__info-value">
          {yearRelease !== "-" ? `${yearRelease}` : <span className="detailes-page__info-no-info">{yearRelease}</span>}
        </div>
      </div>
      {detailes.status !== "Released" && (
        <div className="detailes-page__info-row">
          <div className="detailes-page__info-option">Status</div>
          <div className="detailes-page__info-value">{detailes.status}</div>
        </div>
      )}

      <div className="detailes-page__info-row">
        <div className="detailes-page__info-option">Genres</div>
        <div className="detailes-page__info-value">{detailes.genres}</div>
      </div>
      <div className="detailes-page__info-row">
        <div className="detailes-page__info-option">Company</div>
        <div className="detailes-page__info-value">
          {isMediaTypeTV ? (
            detailes.networks
          ) : detailes.production_companies !== "-" ? (
            detailes.production_companies
          ) : (
            <span className="detailes-page__info-no-info">-</span>
          )}
        </div>
      </div>
      <div className="detailes-page__info-row">
        <div className="detailes-page__info-option">Users rating</div>
        <div className="detailes-page__info-value">
          {detailes.vote_average !== "-" ? (
            detailes.vote_average
          ) : (
            <span className="detailes-page__info-no-info">-</span>
          )}
        </div>
      </div>
      <div className="detailes-page__info-row">
        <div className="detailes-page__info-option">Runtime</div>
        <div className="detailes-page__info-value">
          {runtime !== "-" && runtime ? `${runtime} min` : <span className="detailes-page__info-no-info">-</span>}
        </div>
      </div>

      {isMediaTypeTV && (
        <div className="detailes-page__info-row">
          <div className="detailes-page__info-option">My rating</div>
          <div className="detailes-page__info-value">
            <UserRating id={id} firebaseRef="userShow" showRating={true} mediaType={mediaType} />
          </div>
        </div>
      )}

      {!isMediaTypeTV && (
        <>
          <div className="detailes-page__info-row">
            <div className="detailes-page__info-option">Tagline</div>
            <div className="detailes-page__info-value">
              {detailes.tagline !== "-" ? (
                `${detailes.tagline}`
              ) : (
                <span className="detailes-page__info-no-info">{detailes.tagline}</span>
              )}
            </div>
          </div>
          <div className="detailes-page__info-row">
            <div className="detailes-page__info-option">Budget</div>
            <div className="detailes-page__info-value">{formatedBudget}</div>
          </div>
          <div className="detailes-page__info-row">
            <div className="detailes-page__info-option">External links</div>
            <div className="detailes-page__info-value">
              <a
                href={`https://www.imdb.com/title/${detailes.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="detailes-page__info-imdb"
              />
            </div>
          </div>
        </>
      )}

      <div className="detailes-page__info-row detailes-page__info--button">
        {isMediaTypeTV && <ShowsButtonsRed id={id} detailes={detailes} mediaType={mediaType} />}

        {!isMediaTypeTV && (
          <button
            className={classNames("button", {
              "button--pressed": movieInLS
            })}
            onClick={() => {
              if (authUser) {
                context.userContentHandler.handleMovieInDatabases({
                  id: Number(id),
                  data: detailes
                })
                context.userContent.handleUserMoviesOnClient({ id: Number(id), data: detailes })
              } else {
                context.userContentLocalStorage.toggleMovieLS({
                  id: Number(id),
                  data: detailes
                })
              }
            }}
            type="button"
          >
            {movieInLS ? "Remove" : "Watch later"}
          </button>
        )}
      </div>
    </div>
  )
}

export default MainInfo
