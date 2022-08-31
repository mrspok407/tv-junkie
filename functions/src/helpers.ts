export const mergeEpisodesFromFireDBwithUserDB = (showEpisodesFire: any, showEpisodesUser: any) => {
  const updateData: any = [];

  showEpisodesFire.forEach((season: any, seasonIndex: any) => {
    const newEpisodes = season.episodes.map((episode: any, episodeIndex: any) => {
      const newEpisode = {
        air_date: episode.air_date,
        userRating: showEpisodesUser[seasonIndex]?.episodes[episodeIndex]?.userRating ?? 0,
        watched: showEpisodesUser[seasonIndex]?.episodes[episodeIndex]?.watched ?? false
      };
      return newEpisode;
    });

    const newSeason = {
      episodes: newEpisodes,
      season_number: season.season_number,
      userRating: showEpisodesUser[seasonIndex]?.userRating ?? 0
    };
    updateData.push(newSeason);
  });

  return updateData;
};

export const episodesToOneArray = (data: any) => {
  if (!Array.isArray(data)) return [];
  return data.reduce((acc, season) => {
    const seasonEpisodes = season?.episodes?.filter(Boolean);
    if (!Array.isArray(seasonEpisodes) || seasonEpisodes.length === 0) return acc;

    const seasonEpisodesWithIndex = seasonEpisodes.map((episode, index) => {
      return {...episode, index};
    });
    acc.push(...seasonEpisodesWithIndex);
    return acc;
  }, []);
};
