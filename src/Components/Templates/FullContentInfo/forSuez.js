userContent.showsDatabases.forEach(database => {
  // Лупим в какой базе у юзера находится: смотри, дроп, будет см
  counter++

  firebase.userShow(authUser.uid, Number(id), database).on(
    "value",
    snapshot => {
      console.log("updated")
      if (snapshot.val() !== null) {
        const userShow = snapshot.val()
        const allShowsListSubDatabase =
          userShow.status === "Ended" || userShow.status === "Canceled" ? "ended" : "ongoing" // Чекаем статус сирика, чтобы в общей базе искать в нужной сабБазе (ongoing),
        // т.к. ending не обновятся уже, незачем в одной общей держать

        firebase
          .showInDatabase(allShowsListSubDatabase, Number(id))
          .once("value", snapshot => {
            const show = snapshot.val()

            let updatedSeasons = []

            show.episodes.forEach((season, indexSeason) => {
              // Луплю сизоны, делаю пустой аррай для обновлённых эпизодов
              let updatedEpisodes = []

              season.episodes.forEach((episode, indexEpisode) => {
                // Луплю эпизоды сезона
                const seasonPath = userShow.episodes[indexSeason]
                const watched =
                  seasonPath && seasonPath.episodes[indexEpisode]
                    ? seasonPath.episodes[indexEpisode].watched
                    : false // Эта проверка на существование сезона и эпизода в базе юзера. Если у юзера 5 сезонов в базе, а на некст дэй вышел 6й сезон
                // сирик обновился в общей базе, добавился 6й сиз, у юзера 5 по-прежнему. Поэтому когда дойдёт до несущесвующего 6го сезона у юзера
                // оно false сделает переменной, не смотрел еще тип очевидно

                const updatedEpisode = {
                  // Обновлённый эпизод с добавленным правильным watched, такой какой был в базе юзера
                  ...episode,
                  watched: watched
                }
                updatedEpisodes.push(updatedEpisode) // Тюпо пушу
              })

              const updatedSeason = {
                ...season,
                episodes: updatedEpisodes // Все запушенные эпизоды добавляю в обновленный сезон, со всеми правильными переменными watched
              }

              updatedSeasons.push(updatedSeason) // Tupo pushu
            })

            firebase.userShowAllEpisodes(authUser.uid, Number(id), database).set(updatedSeasons) // Обновляю базу юзера добавляю новый сезон/серии если вышли
            // watched будет false (строка 29)
          })
          .then(() => {
            if (counter === userContent.showsDatabases.length) {
              setLoadingFromDatabase(false)
              console.log("loading finished") // Из того, что я нарыл, как определить что весь forEach завершён. Просто counter создавать, и когда он станет
              // равным длинне аррая что я forEach'у, тогда всё
            }
          })

        setShowInDatabase({ database, info: userShow })
        setShowDatabaseOnClient(database)
      }
    },
    error => {
      console.log(`Error in database occured. ${error}`)

      setShowDatabaseOnClient(showInDatabase.database)
    }
  )
})
