"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDatabaseFromAPI = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios_1 = require("axios");
admin.initializeApp();
const database = admin.database();
const config = functions.config();
exports.updateDatabaseFromAPI = functions.pubsub
    .schedule("0 03 * * *")
    .timeZone("UTC")
    .onRun(context => {
    database
        .ref("allShowsList/ongoing")
        .once("value", snapshot => {
        if (snapshot.val() === null)
            return;
        let shows = [];
        snapshot.forEach(item => {
            shows = [...shows, item.val()];
        });
        shows.forEach(show => {
            axios_1.default
                .get(`https://api.themoviedb.org/3/tv/${show.id}?api_key=${config.api.tmdb}&language=en-US`)
                .then(({ data: { number_of_seasons } }) => {
                const maxSeasonsInChunk = 20;
                const allSeasons = [];
                const seasonChunks = [];
                const apiRequests = [];
                for (let i = 1; i <= number_of_seasons; i += 1) {
                    allSeasons.push(`season/${i}`);
                }
                for (let i = 0; i <= allSeasons.length; i += maxSeasonsInChunk) {
                    const chunk = allSeasons.slice(i, i + maxSeasonsInChunk);
                    seasonChunks.push(chunk.join());
                }
                seasonChunks.forEach(item => {
                    const request = axios_1.default.get(`https://api.themoviedb.org/3/tv/${show.id}?api_key=${config.api.tmdb}&append_to_response=${item}`);
                    apiRequests.push(request);
                });
                return axios_1.default.all([...apiRequests]);
            })
                .then(axios_1.default.spread((...responses) => {
                const rowData = [];
                const seasonsData = [];
                responses.forEach(item => {
                    rowData.push(item.data);
                });
                const mergedRowData = Object.assign({}, ...rowData);
                Object.entries(mergedRowData).forEach(([key, value]) => {
                    if (!key.indexOf("season/")) {
                        seasonsData.push({ [key]: Object.assign({}, value) });
                    }
                });
                const allEpisodes = [];
                seasonsData.forEach((data, index) => {
                    const season = data[`season/${index + 1}`];
                    if (!Array.isArray(season.episodes) || season.episodes.length === 0)
                        return;
                    const episodes = [];
                    season.episodes.forEach((item) => {
                        const updatedEpisode = {
                            air_date: item.air_date,
                            episode_number: item.episode_number,
                            name: item.name,
                            season_number: item.season_number,
                            id: item.id
                        };
                        episodes.push(updatedEpisode);
                    });
                    const updatedSeason = {
                        air_date: season.air_date,
                        season_number: season.season_number,
                        id: season._id,
                        poster_path: season.poster_path,
                        name: season.name,
                        episodes
                    };
                    allEpisodes.push(updatedSeason);
                });
                const dataToPass = {
                    episodes: allEpisodes,
                    status: mergedRowData.status
                };
                return dataToPass;
            }))
                .then(data => {
                database
                    .ref("allShowsList/ongoing")
                    .child(show.id)
                    .update({ episodes: data.episodes })
                    .catch(err => {
                    console.log(err);
                });
            })
                .catch(err => {
                console.log(err);
            });
        });
    })
        .catch(err => {
        console.log(err);
    });
    return;
});
//# sourceMappingURL=index.js.map