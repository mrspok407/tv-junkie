import { differenceInCalendarDays, isValid } from 'date-fns'
import format from 'date-fns/format'
import { currentDate, isContentReleasedValid } from 'Utils'

type Props = {
  contentReleasedValue: Date | string | number | undefined | null
  formatSettings: string
}

const useFormatContentDate = ({ contentReleasedValue, formatSettings }: Props) => {
  const contentReleasedDate = new Date(contentReleasedValue ?? '')
  const isDateNotValid = !isValid(contentReleasedDate)

  const dateReadableFormat = isDateNotValid ? 'No date available' : format(contentReleasedDate, formatSettings)
  const daysToRelease = isDateNotValid
    ? 'No date available'
    : differenceInCalendarDays(contentReleasedDate, currentDate)
  const [isContentAired] = isContentReleasedValid(contentReleasedValue)

  return {
    dateReadableFormat,
    daysToRelease,
    isContentAired,
    isDateNotValid,
  }
}

export default useFormatContentDate
