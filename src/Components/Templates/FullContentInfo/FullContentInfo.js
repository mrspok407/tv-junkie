/* eslint-disable no-use-before-define */
import React, { useState, useEffect, useContext } from "react"
import axios from "axios"
import { SelectedContentContext } from "../../Context/SelectedContentContext"
import { API_KEY } from "../../../Utils"
import "./FullContentInfo.scss"

export default function FullContentInfo({
  match: {
    params: { id, mediaType }
  }
}) {
  const [options, setOptions] = useState({
    poster: "",
    title: "",
    releaseDate: "",
    lastAirDate: "",
    runtime: "",
    status: "",
    genres: [],
    network: "",
    webChannel: "",
    rating: "",
    description: "",
    seasons: ""
  })

  const { selectedContent, toggleContent } = useContext(SelectedContentContext)
  console.log(selectedContent)

  useEffect(() => {
    if (mediaType === "show") {
      getFullShowInfo()
    } else if (mediaType === "movie") {
      getFullMovieInfo()
    }
  }, [mediaType])

  const getFullShowInfo = () => {
    console.log("show")
    axios
      .get(
        `https://api.themoviedb.org/3/tv/${id}/external_ids?api_key=${API_KEY}&language=en-US`
      )
      .then(({ data: { tvdb_id } }) => {
        const tvdbId = tvdb_id

        return axios.get(
          `http://api.tvmaze.com/lookup/shows?thetvdb=${tvdbId}&embed=episodes`
        )
      })
      .then(({ data }) => {
        const tvmazeId = data.id

        return axios.get(
          `http://api.tvmaze.com/shows/${tvmazeId}?embed[]=episodes&embed[]=seasons&embed[]=previousepisode`
        )
      })
      .then(
        ({
          data: {
            name,
            image,
            premiered,
            runtime,
            status,
            genres,
            network,
            webChannel,
            rating,
            summary,
            _embedded
          }
        }) => {
          setOptions({
            poster: image.original,
            title: name,
            releaseDate: premiered,
            lastAirDate: _embedded.previousepisode.airdate,
            runtime,
            status,
            genres,
            network: network ? network.name : false,
            webChannel: webChannel ? webChannel.name : false,
            rating,
            description: summary,
            seasons: _embedded.seasons.length
          })
        }
      )
  }

  const getFullMovieInfo = () => {
    console.log("movie")
  }

  const {
    poster,
    title,
    releaseDate,
    lastAirDate,
    runtime,
    status,
    genres,
    network,
    webChannel,
    rating,
    description
  } = options

  const yearRelease = releaseDate.slice(0, 4)
  const yearEnded = lastAirDate.slice(0, 4)

  const yearRange =
    status === "Running"
      ? `${yearRelease} - ...`
      : status === "Ended" && `${yearRelease} - ${yearEnded}`

  const company = network || webChannel
  const formatedDescription = description
    .split("<p>")
    .join("")
    .split("</p>")
    .join("")
    .split("<b>")
    .join("")
    .split("</b>")
    .join("")
    .split("<i>")
    .join("")
    .split("</i>")
    .join("")

  return (
    <div className="full-detailes-container">
      <div className="full-detailes">
        <div className="full-detailes__poster-wrapper">
          <div
            className="full-detailes__poster"
            style={{ backgroundImage: `url(${poster})` }}
          />
        </div>

        <div className="full-detailes__info">
          <div className="full-detailes__info-title">
            {title}
            <span>
              {mediaType === "show" && title ? ` (${yearRange})` : ""}
            </span>
          </div>
          <div className="full-detailes__info-row">
            <div className="full-detailes__info-option">Year</div>
            <div className="full-detailes__info-value">{yearRelease}</div>
          </div>
          <div className="full-detailes__info-row">
            <div className="full-detailes__info-option">Status</div>
            <div className="full-detailes__info-value">{status}</div>
          </div>
          <div className="full-detailes__info-row">
            <div className="full-detailes__info-option">Genres</div>
            <div className="full-detailes__info-value">{genres.join(", ")}</div>
          </div>
          <div className="full-detailes__info-row">
            <div className="full-detailes__info-option">Company</div>
            <div className="full-detailes__info-value">{company}</div>
          </div>
          <div className="full-detailes__info-row">
            <div className="full-detailes__info-option">Rating</div>
            <div className="full-detailes__info-value">{rating.average}</div>
          </div>
          <div className="full-detailes__info-row">
            <div className="full-detailes__info-option">Runtime</div>
            <div className="full-detailes__info-value">{runtime} min</div>
          </div>
          <div className="full-detailes__info-row">
            {selectedContent.some(e => e.id === Number(id)) ? (
              <button
                className="button button--searchlist button--pressed"
                onClick={() => toggleContent(Number(id), selectedContent)}
                type="button"
              >
                Remove {mediaType === "movie" ? "movie" : "show"}
              </button>
            ) : (
              <button
                className="button button--searchlist"
                onClick={() => toggleContent(Number(id), selectedContent)}
                type="button"
              >
                Add {mediaType === "movie" ? "movie" : "show"}
              </button>
            )}
          </div>
        </div>
        <div className="full-detailes__info-description">
          {formatedDescription}
        </div>
      </div>
    </div>
  )
}
