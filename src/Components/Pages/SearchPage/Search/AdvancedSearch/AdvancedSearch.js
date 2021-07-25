/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from "react"
import { Formik, Form } from "formik"
import { Persist } from "formik-persist"
import * as Yup from "yup"
import classNames from "classnames"
import DatesInputs from "./DatesInputs/DatesInputs"
import GenreInputs from "./GenreInputs/GenreInputs"
import VotesRatingSortType from "./VotesRatingSortType/VotesRatingSortType"
import WithActorsInput from "./WithActorsInput/WithActorsInput"
import Loader from "Components/UI/Placeholders/Loader"
import { listOfGenres } from "Utils"
import "./AdvancedSearch.scss"

export default function AdvancedSearch({
  advancedSearch,
  searchingAdvancedSearch,
  withActors,
  toggleActor,
  clearWithActors
}) {
  const [advSearchOpen, setAdvSearchOpen] = useState(false)
  const [genres, setGenres] = useState(listOfGenres)

  function toggleGenre(e) {
    const newGenres = [...genres]
    const genre = newGenres.find((item) => item.name?.toLowerCase() === e.target.value)
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
        mediaType: "movie"
      }}
      validationSchema={Yup.object({
        // year: Yup.mixed().required("Required")
      })}
      onSubmit={(values, { setSubmitting, setFieldValue }) => {
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
      {({ setFieldValue, handleChange, values }) => (
        <div className="advanced-search__cont">
          <button className="button button--adv-search-form" onClick={() => setAdvSearchOpen(!advSearchOpen)}>
            {!advSearchOpen ? "Open Advanced Search" : "Close Advanced Search"}
          </button>
          {advSearchOpen && (
            <div className="form__wrapper">
              <Form>
                <div className="inputs__cont">
                  <div className="inputs__dates">
                    <DatesInputs
                      setFieldValue={setFieldValue}
                      handleChange={handleChange}
                      // year={year}
                      // changeYear={changeYear}
                    />
                  </div>
                  <div className="inputs__genres-wrapper">
                    <GenreInputs toggleGenre={toggleGenre} genres={genres} />
                  </div>
                  <div className="inputs__other">
                    <VotesRatingSortType handleChange={handleChange} />
                  </div>
                  {values.mediaType === "movie" ? (
                    <WithActorsInput toggleActor={toggleActor} withActors={withActors} />
                  ) : (
                    ""
                  )}
                </div>

                <div className="inputs__buttons">
                  <div className="inputs__buttons--search">
                    <button
                      className={classNames("button", {
                        "button--loading": searchingAdvancedSearch
                      })}
                      type="submit"
                    >
                      Search
                    </button>
                    {searchingAdvancedSearch && <Loader className="loader--small-pink" />}
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
