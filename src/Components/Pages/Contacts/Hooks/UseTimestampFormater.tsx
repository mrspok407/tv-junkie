import { useState, useMemo } from 'react'

type Props = {
  timeStamp: number | string | null
}

const useTimestampFormater = ({ timeStamp }: Props) => {
  const [formatedDate, setFormatedDate] = useState<number | string | null>(timeStamp)

  useMemo(() => {
    if (!timeStamp) {
      setFormatedDate(null)
      return
    }
    const todayDate = new Date()
    const timeStampDate = new Date(timeStamp!)

    const timeStampDay = timeStampDate.toLocaleDateString()
    const todayDay = todayDate.toLocaleDateString()
    const yesterdayDay = new Date(new Date(new Date().setDate(new Date().getDate() - 1))).toLocaleDateString()

    const timeStampTime = new Date(Number(timeStamp)).toLocaleTimeString().slice(0, -3)

    if (timeStampDay === todayDay) {
      setFormatedDate(timeStampTime)
    } else if (timeStampDay === yesterdayDay) {
      setFormatedDate('Yesterday')
    } else {
      setFormatedDate(timeStampDay!)
    }
  }, [timeStamp])

  return formatedDate
}

export default useTimestampFormater
