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
import "./AdvancedSearch.scss"

export default React.memo(function AdvancedSearch({
  advancedSearch,
  API_KEY,
  withActors,
  toggleActor,
  clearWithActors
}) {
  const listOfYears = increment => {
    const years = []
    for (let i = 2020; i >= 1900; i -= increment) {
      years.push(i)
    }
    return years
  }

  const [advSearchOpen, setAdvSearchOpen] = useState(true)
  const [genres, setGenres] = useState([
    {
      id: 28,
      name: "Action",
      isChecked: false
    },
    {
      id: 12,
      name: "Adventure",
      isChecked: false
    },
    {
      id: 16,
      name: "Animation",
      isChecked: false
    },
    {
      id: 35,
      name: "Comedy",
      isChecked: false
    },
    {
      id: 80,
      name: "Crime",
      isChecked: false
    },
    {
      id: 99,
      name: "Documentary",
      isChecked: false
    },
    {
      id: 18,
      name: "Drama",
      isChecked: false
    },
    {
      id: 10751,
      name: "Family",
      isChecked: false
    },
    {
      id: 14,
      name: "Fantasy",
      isChecked: false
    },
    {
      id: 36,
      name: "History",
      isChecked: false
    },
    {
      id: 27,
      name: "Horror",
      isChecked: false
    },
    {
      id: 10402,
      name: "Music",
      isChecked: false
    },
    {
      id: 9648,
      name: "Mystery",
      isChecked: false
    },
    {
      id: 10749,
      name: "Romance",
      isChecked: false
    },
    {
      id: 878,
      name: "Science Fiction",
      isChecked: false
    },
    {
      id: 10770,
      name: "TV Movie",
      isChecked: false
    },
    {
      id: 53,
      name: "Thriller",
      isChecked: false
    },
    {
      id: 10752,
      name: "War",
      isChecked: false
    },
    {
      id: 37,
      name: "Western",
      isChecked: false
    }
  ])

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
        sortBy: "vote_count.desc"
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
          {advSearchOpen && (
            <div className="form__wrapper">
              <Form>
                <div className="inputs__cont">
                  <div className="inputs__dates">
                    <DatesInputs
                      setFieldValue={setFieldValue}
                      handleChange={handleChange}
                      listOfYears={listOfYears}
                    />
                  </div>
                  <div className="inputs__genres-wrapper">
                    <GenreInputs toggleGenre={toggleGenre} genres={genres} />
                  </div>
                  <div className="inputs__other">
                    <VotesRatingSort handleChange={handleChange} />
                  </div>

                  <div className="inputs__with-actors">
                    <WithActorsInput
                      API_KEY={API_KEY}
                      // eslint-disable-next-line react/no-this-in-sfc
                      toggleActor={toggleActor}
                      withActors={withActors}
                    />
                  </div>
                </div>

                <div className="inputs__buttons">
                  <div className="inputs__buttons--search">
                    <button className="button" type="submit">
                      Search
                    </button>
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
})
