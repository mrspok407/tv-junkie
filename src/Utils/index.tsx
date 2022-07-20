/* eslint-disable no-useless-escape */
import iconMediaTypeMulti from 'assets/images/icons/media-type-multi.png'
import iconMediaTypeMovie from 'assets/images/icons/media-type-movie.png'
import iconMediaTypePerson from 'assets/images/icons/media-type-person.png'
import iconMediaTypeTv from 'assets/images/icons/media-type-tv.png'
import merge from 'deepmerge'
import * as _transform from 'lodash.transform'
import * as _isEqual from 'lodash.isequal'
import * as _isObject from 'lodash.isobject'
import releasedEpisodesToOneArray from './releasedEpisodesToOneArray'

export const currentDate = new Date()

export const range = (start: any, stop: any, step: any) => {
  return Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step)
}

export const differenceBtwDatesInDays = (firstDate: any, secondDate: any) => {
  const dateOne = new Date(firstDate) as any
  const dateTwo = new Date(secondDate) as any
  const diffInTime = dateOne - dateTwo
  const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24))
  return diffInDays
}

export const sortBy = [
  { name: 'Most vote count', codeName: 'vote_count.desc' },
  { name: 'Most popular', codeName: 'popularity.desc' },
  { name: 'Most recent', codeName: 'primary_release_date.desc' },
  { name: 'Average vote', codeName: 'vote_average.desc' },
]

export const mediaTypesArr = [
  { type: 'Multi', icon: iconMediaTypeMulti, id: 22 },
  { type: 'Movie', icon: iconMediaTypeMovie, id: 52 },
  { type: 'TV', icon: iconMediaTypeTv, id: 24 },
  { type: 'Person', icon: iconMediaTypePerson, id: 21 },
]

export const validEmailRegex = RegExp(
  // eslint-disable-next-line max-len
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
)

export const combineMergeObjects = (target: any, source: any, options: any) => {
  const destination = target.slice()

  source.forEach((item: any, index: any) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
    } else if (options.isMergeableObject(item)) {
      destination[index] = merge(target[index], item, options)
    } else if (target.indexOf(item) === -1) {
      destination.push(item)
    }
  })
  return destination
}

export const differenceInObjects = (object: any, base: any) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  function changes(object: any, base: any) {
    return _transform(object, (result: any, value: any, key: any) => {
      if (!_isEqual(value, base[key])) {
        // eslint-disable-next-line no-param-reassign
        result[key] = _isObject(value) && _isObject(base[key]) ? changes(value, base[key]) : value
      }
    })
  }
  return changes(object, base)
}

export const isUnexpectedObject = ({
  exampleObject,
  targetObject,
}: {
  exampleObject: any
  targetObject: any
}): boolean =>
  Object.entries(exampleObject).some(([key, value]) => {
    if (targetObject[key] === undefined) {
      return true
    }
    if (Array.isArray(value)) {
      return !value.some((item) => typeof item === typeof targetObject[key])
    }

    return typeof targetObject[key] !== typeof value
  })

export const convertTimeStampToDate = ({ timeStamp }: { timeStamp: any }) => {
  if (!timeStamp || !Number.isInteger(timeStamp)) return
  const timeStampISO = new Date(timeStamp).toISOString()
  const options = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  } as const
  const formatedTimeStamp = new Date(timeStampISO)
  return new Intl.DateTimeFormat('en-US', options).format(formatedTimeStamp)
}

export const textToUrl = ({ text }: { text: any }) => {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g
  const textWithUrls = text.replace(urlRegex, (url: any) => {
    let hyperlink = url
    if (!hyperlink.match('^https?://')) {
      hyperlink = `http://${hyperlink}`
    }
    return `<a href="${hyperlink}" target="_blank" rel="noopener noreferrer">${url}</a>`
  })
  return textWithUrls
}

export { releasedEpisodesToOneArray }

export const isScrollNearBottom = ({ scrollThreshold }: { scrollThreshold: number }) => {
  return window.innerHeight + window.scrollY >= document.body.scrollHeight - scrollThreshold
}

export const removeUndefinedNullFromObject = (obj: any) => {
  const newObj: any = {}
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined || obj[key] === null) {
      delete obj[key]
    } else if (_isObject(obj[key])) {
      newObj[key] = removeUndefinedNullFromObject(obj[key])
      if (!Object.keys(newObj[key]).length) {
        delete newObj[key]
      }
    } else {
      newObj[key] = obj[key]
    }
  })
  return newObj
}

export const artificialAsyncDelay = (timeout: number) =>
  new Promise((res) => {
    setTimeout(() => res(''), timeout)
  })

export const isArrayIncludes = (id: string | number, data: Array<unknown>) => data.includes(id)
