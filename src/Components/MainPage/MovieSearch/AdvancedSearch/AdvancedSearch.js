/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from "react"
import { Formik, Form } from "formik"
import { Persist } from "formik-persist"
import * as Yup from "yup"
import DatesInputs from "./DatesInputs/DatesInputs"
import GenreInputs from "./GenreInputs/GenreInputs"
import VotesRatingSort from "./VotesRatingSort/VotesRatingSort"
import WithActorsInput from "./WithActorsInput/WithActorsInput"
import Loader from "../../Placeholders/Loader"
import { listOfGenres } from "../../../../Utils"
import "./AdvancedSearch.scss"

export default function AdvancedSearch({
  advancedSearch,
  searchingAdvancedSearch,
  API_KEY,
  withActors,
  toggleActor,
  clearWithActors
}) {
  const [advSearchOpen, setAdvSearchOpen] = useState(true)
  const [genres, setGenres] = useState(listOfGenres)

  function toggleGenre(e) {
    const newGenres = [...genres]
    const genre = newGenres.find(
      item => item.name.toLowerCase() === e.target.value
    )
    const data = e.target.getAttribute("data")

    genre.isChecked = !genre.isChecked

    if (data === "withGenre") {
      genre.withGenre = !genre.withGenre
    } else if (data === "withoutGenre") {
      genre.withoutGenre = !genre.withoutGenre
    }

    setGenres(newGenres)
  }

  function clearCheckboxes() {
    const newGenres = [...genres]
    const resetGenres = newGenres.map(({ id, name }) => {
      return {
        id,
        name,
        isChecked: false,
        withGenre: false,
        withoutGenre: false
      }
    })
    setGenres(resetGenres)
  }

  return (
    <Formik
      initialValues={{
        year: "",
        decade: "",
        yearFrom: "",
        yearTo: "",
        rating: "",
        voteCount: "",
        sortBy: "vote_count.desc",
        mediaType: "movies"
      }}
      validationSchema={Yup.object({
        // year: Yup.mixed().required("Required")
      })}
      onSubmit={(values, { setSubmitting, setFieldValue }) => {
        // const averageVote = values.averageVote === "" ? "0" : values.averageVote
        let yearTo
        if (values.yearTo < values.yearFrom && values.yearTo !== "") {
          yearTo = values.yearFrom
          setFieldValue("yearTo", values.yearFrom)
        } else {
          yearTo = values.yearTo
        }

        advancedSearch(
          values.year,
          values.decade,
          values.yearFrom,
          yearTo,
          values.rating,
          values.voteCount,
          values.sortBy,
          values.mediaType,
          withActors,
          genres
        )
        setSubmitting(false)
      }}
    >
      {({ setFieldValue, handleChange }) => (
        <div className="advanced-search__cont">
          <button
            className="button button--advanced-search"
            onClick={() => setAdvSearchOpen(!advSearchOpen)}
          >
            Open Advanced Search
          </button>
          {!advSearchOpen && (
            <div className="form__wrapper">
              <Form>
                <div className="inputs__cont">
                  <div className="inputs__dates">
                    <DatesInputs
                      setFieldValue={setFieldValue}
                      handleChange={handleChange}
                    />
                  </div>
                  <div className="inputs__genres-wrapper">
                    <GenreInputs toggleGenre={toggleGenre} genres={genres} />
                  </div>
                  <div className="inputs__other">
                    <VotesRatingSort handleChange={handleChange} />
                  </div>
                  <WithActorsInput
                    API_KEY={API_KEY}
                    toggleActor={toggleActor}
                    withActors={withActors}
                  />
                </div>

                <div className="inputs__buttons">
                  <div className="inputs__buttons--search">
                    <button className="button button--search-adv" type="submit">
                      Search
                    </button>
                    {searchingAdvancedSearch && (
                      <Loader className="loader--adv-results" />
                    )}
                  </div>
                  <div className="inputs__buttons--reset">
                    <button
                      className="button"
                      type="reset"
                      onClick={() => {
                        clearCheckboxes()
                        clearWithActors()
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <Persist name="advFormSearch" />
              </Form>
            </div>
          )}
        </div>
      )}
    </Formik>
  )
}
