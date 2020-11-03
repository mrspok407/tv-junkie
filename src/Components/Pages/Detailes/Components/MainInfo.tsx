/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useContext } from "react"
import ShowsButtons from "./ShowsButtons"
import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import userContentHandler from "Components/UserContent/UserContentHandler"
import UserRating from "Components/UI/UserRating/UserRating"

type Props = {
  detailes: {
    name: string
    title: string
    first_air_date: string
    last_air_date: string
    release_date: string
    status: string
    episode_run_time: string[] | number[]
    runtime: string
    budget: number | bigint
    genres: any
    networks: any
    production_companies: any
    vote_average: string
    tagline: string
    imdb_id: number | string
  }
  movieInDatabase: {} | null
  mediaType: string
  id: number | string
  showDatabaseOnClient: {}
  authUser: {}
  changeShowDatabaseOnClient: () => void
  handleListeners: () => void
  handleMovieInDatabases: () => void
}

export const MainInfo: React.FC<Props> = ({
  movieInDatabase,
  detailes,
  mediaType,
  id,
  showDatabaseOnClient,
  authUser,
  changeShowDatabaseOnClient,
  handleMovieInDatabases
}) => {
  const context = useContext(AppContext)

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
          {yearRelease !== "-" ? (
            `${yearRelease}`
          ) : (
            <span className="detailes-page__info-no-info">{yearRelease}</span>
          )}
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
        <div className="detailes-page__info-option">User rating</div>
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
          {runtime !== "-" && runtime ? (
            `${runtime} min`
          ) : (
            <span className="detailes-page__info-no-info">-</span>
          )}
        </div>
      </div>

      {isMediaTypeTV && (
        <div className="detailes-page__info-row">
          <div className="detailes-page__info-option">My rating</div>
          <div className="detailes-page__info-value">
            <UserRating
              id
              firebaseRef="userShow"
              showDatabase={showDatabaseOnClient}
              showRating={true}
              mediaType
            />
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
        {isMediaTypeTV && (
          <ShowsButtons
            id
            authUser
            detailes
            changeShowDatabaseOnClient
            showDatabaseOnClient
            handleListeners
          />
        )}

        {!isMediaTypeTV && (
          <button
            className={classNames("button", {
              "button--pressed":
                movieInDatabase ||
                context.userContentLocalStorage.watchLaterMovies.find(
                  (item: { id: number }) => item.id === Number(id)
                )
            })}
            onClick={() => {
              if (authUser) {
                handleMovieInDatabases({
                  id: Number(id),
                  data: detailes,
                  userDatabase: "watchLaterMovies"
                })
              } else {
                context.userContentLocalStorage.toggleMovieLS({
                  id: Number(id),
                  data: detailes
                })
              }
            }}
            type="button"
          >
            {movieInDatabase === "watchLaterMovies" ? "Remove" : "Watch later"}
          </button>
        )}
      </div>
    </div>
  )
}

export default userContentHandler(MainInfo)