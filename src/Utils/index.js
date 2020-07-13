/* eslint-disable no-useless-escape */
import iconMediaTypeMulti from "assets/images/icons/media-type-multi.png"
import iconMediaTypeMovie from "assets/images/icons/media-type-movie.png"
import iconMediaTypePerson from "assets/images/icons/media-type-person.png"
import iconMediaTypeTv from "assets/images/icons/media-type-tv.png"

export const todayDate = new Date()

export const range = (start, stop, step) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step)

export const differenceBtwDatesInDays = (firstDate, secondDate) => {
  const diffInTime = new Date(firstDate) - new Date(secondDate)
  const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24))
  return diffInDays
}

export const sortBy = [
  { name: "Most vote count", codeName: "vote_count.desc" },
  { name: "Most popular", codeName: "popularity.desc" },
  { name: "Most recent", codeName: "primary_release_date.desc" },
  { name: "Average vote", codeName: "vote_average.desc" }
]

export const listOfGenres = [
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
  },
  {
    id: 10759,
    name: "Action & Adventure",
    isChecked: false
  },
  {
    id: 10762,
    name: "Kids",
    isChecked: false
  },
  {
    id: 10763,
    name: "News",
    isChecked: false
  },
  {
    id: 10764,
    name: "Reality",
    isChecked: false
  },
  {
    id: 10765,
    name: "Sci-Fi & Fantasy",
    isChecked: false
  },
  {
    id: 10766,
    name: "Soap",
    isChecked: false
  },
  {
    id: 10767,
    name: "Talk",
    isChecked: false
  },
  {
    id: 10768,
    name: "War & Politics",
    isChecked: false
  }
]

export const mediaTypesArr = [
  { type: "Multi", icon: iconMediaTypeMulti, id: 22 },
  { type: "Movie", icon: iconMediaTypeMovie, id: 52 },
  { type: "TV", icon: iconMediaTypeTv, id: 24 },
  { type: "Person", icon: iconMediaTypePerson, id: 21 }
]

export const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
)
