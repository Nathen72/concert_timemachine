// Setlist.fm API types
export interface SetlistFmArtist {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation?: string;
  url: string;
}

export interface SetlistFmVenue {
  id: string;
  name: string;
  city: {
    id: string;
    name: string;
    state?: string;
    stateCode?: string;
    coords?: {
      lat: number;
      long: number;
    };
    country: {
      code: string;
      name: string;
    };
  };
  url: string;
}

export interface SetlistFmSong {
  name: string;
  cover?: SetlistFmArtist;
  info?: string;
  tape?: boolean;
}

export interface SetlistFmSet {
  name?: string;
  encore?: number;
  song: SetlistFmSong[];
}

export interface SetlistFmSetlist {
  id: string;
  versionId: string;
  eventDate: string;
  lastUpdated: string;
  artist: SetlistFmArtist;
  venue: SetlistFmVenue;
  tour?: {
    name: string;
  };
  sets: {
    set: SetlistFmSet[];
  };
  info?: string;
  url: string;
}

export interface SetlistFmSearchResponse {
  type: string;
  itemsPerPage: number;
  page: number;
  total: number;
  setlist: SetlistFmSetlist[];
}

const SETLIST_FM_API_BASE = 'https://api.setlist.fm/rest/1.0';
const API_KEY = import.meta.env.VITE_SETLISTFM_API_KEY || '';

export const searchSetlists = async (params: {
  artistName?: string;
  artistMbid?: string;
  cityName?: string;
  date?: string;
  year?: string;
  p?: number; // page number
}): Promise<SetlistFmSearchResponse> => {
  const queryParams = new URLSearchParams();

  if (params.artistName) queryParams.append('artistName', params.artistName);
  if (params.artistMbid) queryParams.append('artistMbid', params.artistMbid);
  if (params.cityName) queryParams.append('cityName', params.cityName);
  if (params.date) queryParams.append('date', params.date);
  if (params.year) queryParams.append('year', params.year);
  if (params.p) queryParams.append('p', params.p.toString());

  const response = await fetch(
    `${SETLIST_FM_API_BASE}/search/setlists?${queryParams.toString()}`,
    {
      headers: {
        'Accept': 'application/json',
        'x-api-key': API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Setlist.fm API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const getSetlistById = async (setlistId: string): Promise<SetlistFmSetlist> => {
  const response = await fetch(
    `${SETLIST_FM_API_BASE}/setlist/${setlistId}`,
    {
      headers: {
        'Accept': 'application/json',
        'x-api-key': API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Setlist.fm API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
