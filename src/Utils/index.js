/* eslint-disable no-useless-escape */
import iconMediaTypeMulti from "assets/images/icons/media-type-multi.png"
import iconMediaTypeMovie from "assets/images/icons/media-type-movie.png"
import iconMediaTypePerson from "assets/images/icons/media-type-person.png"
import iconMediaTypeTv from "assets/images/icons/media-type-tv.png"
import releasedEpisodesToOneArray from "./releasedEpisodesToOneArray"
import merge from "deepmerge"
import * as _transform from "lodash.transform"
import * as _isEqual from "lodash.isequal"
import * as _isObject from "lodash.isobject"

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

export const anime = [
  95479,
  98123,
  65329,
  82739,
  40424,
  70882,
  61223,
  78462,
  96316,
  71376,
  63323,
  62741,
  62255,
  73946,
  37585,
  75208,
  98986,
  61901,
  95269,
  35753,
  15655,
  98867,
  86836,
  69367,
  63087,
  88803,
  106676,
  65945,
  45501,
  39434,
  63187,
  83054,
  72296,
  42942,
  61178,
  78102,
  68960,
  99779,
  76130,
  85841,
  46184,
  106691,
  83121,
  58539,
  87739,
  86470,
  45998,
  31572,
  50325,
  76757,
  67043,
  12089,
  64671,
  61817,
  42554,
  45997,
  92685,
  88061,
  63942,
  102788,
  61915,
  87462,
  69607,
  13407,
  74081,
  67075,
  66120,
  88042,
  45783,
  82867,
  109360,
  92660,
  99995,
  71000,
  93522,
  23587,
  98491,
  39614,
  46671,
  21729,
  61459,
  94664,
  87461,
  93149,
  1279,
  57755,
  34142,
  46169,
  67154,
  111111,
  67126,
  38603,
  40605,
  99401,
  37548,
  74569,
  44257,
  103254,
  4468,
  88043,
  57565,
  79166,
  31718,
  68573,
  43167,
  14944,
  99536,
  95517,
  37437,
  4020,
  65931,
  92602,
  34152,
  61445,
  2223,
  5072,
  67131,
  80560,
  36697,
  67773,
  45859,
  65333,
  69285,
  75676,
  83103,
  61791,
  70878,
  35610,
  39379,
  72636,
  21855,
  42410,
  73055,
  80539,
  45950,
  2394,
  85551,
  93107,
  65733,
  11008,
  27845,
  66990,
  74500,
  80546,
  80563,
  10663,
  35790,
  43927,
  63146,
  66730,
  71307,
  88045,
  43318,
  46392,
  48561,
  5566,
  65292,
  23406,
  34208,
  44103,
  13916,
  60216,
  1126,
  86601
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

export const combineMergeObjects = (target, source, options) => {
  const destination = target.slice()

  source.forEach((item, index) => {
    if (typeof destination[index] === "undefined") {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
    } else if (options.isMergeableObject(item)) {
      destination[index] = merge(target[index], item, options)
    } else if (target.indexOf(item) === -1) {
      destination.push(item)
    }
  })
  return destination
}

export const differenceInObjects = (object, base) => {
  function changes(object, base) {
    return _transform(object, function (result, value, key) {
      if (!_isEqual(value, base[key])) {
        result[key] = _isObject(value) && _isObject(base[key]) ? changes(value, base[key]) : value
      }
    })
  }
  return changes(object, base)
}

export { releasedEpisodesToOneArray }
