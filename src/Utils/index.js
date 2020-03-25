export const range = (start, stop, step) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step)

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
  }
]

export const mediaTypesArr = ["Multi", "Movie", "TV", "Person"]
