import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import axios from "axios"
import { ContentDetailes, CONTENT_DETAILS_DEFAULT } from "Utils/Interfaces/ContentDetails"
import * as ROUTES from "Utils/Constants/routes"
import * as _get from "lodash.get"

const { CancelToken } = require("axios")
let cancelRequest: any

type Props = {
  id: string
  mediaType: string
}

const useGetDataTMDB = ({ id, mediaType }: Props) => {
  const history = useHistory()
  const [loading, setLoading] = useState(false)
  const [detailes, setDetailes] = useState<ContentDetailes>(CONTENT_DETAILS_DEFAULT)
  const [similarContent, setSimilarContent] = useState<ContentDetailes[]>([])
  const [error, setError] = useState("")

  const getContent = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get<ContentDetailes>(
        `https://api.themoviedb.org/3/${mediaType === "show" ? "tv" : "movie"}/${id}?api_key=${
          process.env.REACT_APP_TMDB_API
        }&language=en-US&append_to_response=${mediaType === "show" ? "similar" : "similar_movies"}`,
        {
          cancelToken: new CancelToken(function executor(c: any) {
            cancelRequest = c
          })
        }
      )

      const genreIds = data.genres && data.genres.length ? data.genres.map((item: { id: number }) => item.id) : "-"
      const genreNames =
        data.genres && data.genres.length ? data.genres.map((item: { name: string }) => item.name).join(", ") : "-"
      const networkNames =
        data.networks && data.networks.length
          ? data.networks.map((item: { name: string }) => item.name).join(", ")
          : "-"
      const prodComp =
        data.production_companies.length === 0 || !data.production_companies ? "-" : data.production_companies[0].name

      const similarType: any = data.similar || data.similar_movies
      const similarContent = similarType.results.filter((item: { poster_path: string }) => item.poster_path)
      const similarContentSortByVotes = similarContent.sort(
        (a: { vote_count: number }, b: { vote_count: number }) => b.vote_count - a.vote_count
      )

      setDetailes({
        ...detailes,
        id: data.id,
        poster_path: data.poster_path,
        backdrop_path: data.backdrop_path,
        name: data.name || data.original_name || "-",
        original_name: data.original_name || "-",
        title: data.title || data.original_title || "-",
        first_air_date: data.first_air_date || "-",
        release_date: data.release_date || "-",
        last_air_date: data.last_air_date || "-",
        episode_run_time: data.episode_run_time || "-",
        runtime: data.runtime || "-",
        status: data.status || "-",
        genres: genreNames || "-",
        genre_ids: genreIds,
        networks: networkNames || "-",
        production_companies: prodComp || "-",
        vote_average: data.vote_average || "-",
        vote_count: data.vote_count || "-",
        overview: data.overview || "-",
        tagline: data.tagline || "-",
        budget: data.budget || 0,
        number_of_seasons: data.number_of_seasons || "-",
        imdb_id: data.imdb_id || "",
        seasonsFromAPI: data.seasons ? data.seasons.reverse() : []
      })

      setLoading(false)
      setSimilarContent(similarContentSortByVotes)
    } catch (err) {
      const error: any = err
      if (axios.isCancel(error)) return
      if (_get(error.response, "status", "") === 404) {
        history.push(ROUTES.PAGE_DOESNT_EXISTS)
        return
      }

      setError("Something went wrong, sorry. Try to reload the page.")
      setLoading(false)
    }
  }

  useEffect(() => {
    getContent()
    return () => {
      if (cancelRequest !== undefined) cancelRequest()
    }
  }, [mediaType, id])

  return [detailes, loading, similarContent, error] as [ContentDetailes, boolean, ContentDetailes[], string]
}

export default useGetDataTMDB
