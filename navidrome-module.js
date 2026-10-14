const NAVIDROME_MODULE = {
  id: 'navidrome-lossless',
  name: 'My Navidrome (FLAC)',
  version: '1.0.0',
  labels: ['FLAC', 'LOSSLESS', 'SELF-HOSTED'],

  // Isi dari pengaturan Anda (sebaiknya disimpan di penyimpanan aman)
  config: {
    baseUrl: 'https://music.example.com',
    user: 'username',
    token: 'md5(password + salt)', // skema token Subsonic
    salt: 'randomsalt',
  },

  _params(extra = {}) {
    const p = new URLSearchParams({
      u: this.config.user,
      t: this.config.token,
      s: this.config.salt,
      v: '1.16.1',
      c: '8spine',
      f: 'json',
      ...extra,
    });
    return p.toString();
  },

  searchTracks: async (query, limit = 20) => {
    const url = `${NAVIDROME_MODULE.config.baseUrl}/rest/search3?${NAVIDROME_MODULE._params({
      query,
      songCount: limit,
      artistCount: 0,
      albumCount: 0,
    })}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Search gagal: ${res.status}`);
    const json = await res.json();
    const songs = json['subsonic-response']?.searchResult3?.song || [];

    const tracks = songs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      duration: s.duration,
      albumCover: `${NAVIDROME_MODULE.config.baseUrl}/rest/getCoverArt?${NAVIDROME_MODULE._params({ id: s.coverArt || s.id })}`,
    }));

    return { tracks, total: tracks.length };
  },

  getTrackStreamUrl: async (trackId, quality = 'LOSSLESS') => {
    // format=raw mengembalikan file asli tanpa transcoding
    const streamUrl = `${NAVIDROME_MODULE.config.baseUrl}/rest/stream?${NAVIDROME_MODULE._params({
      id: trackId,
      format: 'raw',
    })}`;

    return {
      streamUrl,
      track: { id: trackId, audioQuality: 'LOSSLESS' },
    };
  },
};

return NAVIDROME_MODULE;
