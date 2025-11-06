import type { Concert } from '../types';

export const concerts: Concert[] = [
  {
    id: 'nirvana-mtv-unplugged-1993',
    title: 'MTV Unplugged',
    artist: 'Nirvana',
    venue: 'Sony Music Studios',
    date: 'November 18, 1993',
    location: 'New York City, NY',
    attendance: 200,
    description: "Nirvana's intimate acoustic performance that became one of the most iconic live albums of all time. Recorded just months before Kurt Cobain's death, this stripped-down show revealed the band's musical depth and raw emotion.",
    posterImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    venueImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1600&q=80',
    setlist: [
      {
        id: '1',
        title: 'About a Girl',
        spotifyUri: 'spotify:track:5ghIJDpPoe3CfHMGu71E6T',
        durationMs: 225000
      },
      {
        id: '2',
        title: 'Come as You Are',
        spotifyUri: 'spotify:track:2RsAajgo0g7bMCHxwH3Sk0',
        durationMs: 239000
      },
      {
        id: '3',
        title: 'Jesus Doesn\'t Want Me for a Sunbeam',
        spotifyUri: 'spotify:track:0vDHAi3L04jZBDB2AusJe6',
        durationMs: 254000
      },
      {
        id: '4',
        title: 'The Man Who Sold the World',
        spotifyUri: 'spotify:track:2RLlKTYe5zGQ6wXGLEWoJR',
        durationMs: 263000
      },
      {
        id: '5',
        title: 'Pennyroyal Tea',
        spotifyUri: 'spotify:track:7D8KcVjXrPvN1gR29DdVTO',
        durationMs: 206000
      },
      {
        id: '6',
        title: 'Dumb',
        spotifyUri: 'spotify:track:5xTqkOcjGIx8rMZ5LcvfYH',
        durationMs: 151000
      },
      {
        id: '7',
        title: 'Polly',
        spotifyUri: 'spotify:track:4yZfh3V1DbrQQqw1jXGNLe',
        durationMs: 176000
      },
      {
        id: '8',
        title: 'On a Plain',
        spotifyUri: 'spotify:track:7sDImvT7HqTVw3odiruB0K',
        durationMs: 212000
      },
      {
        id: '9',
        title: 'Something in the Way',
        spotifyUri: 'spotify:track:43qVBxPjVjAXPLustmoQoQ',
        durationMs: 235000
      },
      {
        id: '10',
        title: 'Plateau',
        spotifyUri: 'spotify:track:7DPG7jCGhKNMdZTYmh3Oo3',
        durationMs: 195000
      },
      {
        id: '11',
        title: 'All Apologies',
        spotifyUri: 'spotify:track:5G23V9N8LLJ5BubxyB0ZSm',
        durationMs: 203000
      },
      {
        id: '12',
        title: 'Where Did You Sleep Last Night',
        spotifyUri: 'spotify:track:6mXN4pMvSjgWP7lPAexDGr',
        durationMs: 313000
      }
    ]
  },
  {
    id: 'queen-live-aid-1985',
    title: 'Live Aid',
    artist: 'Queen',
    venue: 'Wembley Stadium',
    date: 'July 13, 1985',
    location: 'London, England',
    attendance: 72000,
    description: "Queen's legendary 20-minute set at Live Aid is widely regarded as one of the greatest live rock performances of all time. Freddie Mercury commanded the crowd of 72,000 with unmatched charisma and vocal prowess.",
    posterImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
    venueImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80',
    setlist: [
      {
        id: '1',
        title: 'Bohemian Rhapsody',
        spotifyUri: 'spotify:track:4u7EnebtmKWzUH433cf5Qv',
        durationMs: 354000
      },
      {
        id: '2',
        title: 'Radio Ga Ga',
        spotifyUri: 'spotify:track:5eAcXpfyNLbe8QyjOrl4nB',
        durationMs: 343000
      },
      {
        id: '3',
        title: 'Hammer to Fall',
        spotifyUri: 'spotify:track:3SPTIgNDZN4vwzJqCVQK4f',
        durationMs: 257000
      },
      {
        id: '4',
        title: 'Crazy Little Thing Called Love',
        spotifyUri: 'spotify:track:7ji4K1puXnWiAkJvPmYEbE',
        durationMs: 163000
      },
      {
        id: '5',
        title: 'We Will Rock You',
        spotifyUri: 'spotify:track:4pbJqGIASGPr0ZpGpnWkDn',
        durationMs: 122000
      },
      {
        id: '6',
        title: 'We Are the Champions',
        spotifyUri: 'spotify:track:7ccI9cStQbQdystvc6TvxD',
        durationMs: 179000
      }
    ]
  },
  {
    id: 'johnny-cash-folsom-1968',
    title: 'At Folsom Prison',
    artist: 'Johnny Cash',
    venue: 'Folsom State Prison',
    date: 'January 13, 1968',
    location: 'Folsom, CA',
    attendance: 2000,
    description: "Johnny Cash's groundbreaking concert at Folsom Prison brought his outlaw country music directly to incarcerated men. The raw energy and authenticity of this performance revitalized Cash's career and produced one of the greatest live albums ever recorded.",
    posterImage: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=800&q=80',
    venueImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&q=80',
    setlist: [
      {
        id: '1',
        title: 'Folsom Prison Blues',
        spotifyUri: 'spotify:track:5nRGtGwPekDYOD4xXJgiRh',
        durationMs: 163000
      },
      {
        id: '2',
        title: 'Dark as a Dungeon',
        spotifyUri: 'spotify:track:4D9QBjrD92wCHCCqFaO8Dq',
        durationMs: 186000
      },
      {
        id: '3',
        title: 'I Still Miss Someone',
        spotifyUri: 'spotify:track:3LcQzCefv98yFnmKG4HYsD',
        durationMs: 99000
      },
      {
        id: '4',
        title: 'Cocaine Blues',
        spotifyUri: 'spotify:track:5M66N9BXbJo1wR3P62YBWO',
        durationMs: 178000
      },
      {
        id: '5',
        title: '25 Minutes to Go',
        spotifyUri: 'spotify:track:1P8Tq6fWJrPbHq3B9hNpuj',
        durationMs: 187000
      },
      {
        id: '6',
        title: 'Orange Blossom Special',
        spotifyUri: 'spotify:track:31yXL53xN29yIWZpSSgH49',
        durationMs: 192000
      },
      {
        id: '7',
        title: 'The Long Black Veil',
        spotifyUri: 'spotify:track:7EMxY1gV5hUaxxysydkpv9',
        durationMs: 194000
      },
      {
        id: '8',
        title: 'Send a Picture of Mother',
        spotifyUri: 'spotify:track:1yspW8w54HLqPNh7OFX03H',
        durationMs: 125000
      },
      {
        id: '9',
        title: 'The Wall',
        spotifyUri: 'spotify:track:4Gxq0OhsNXMn0cQd0CIRu1',
        durationMs: 107000
      },
      {
        id: '10',
        title: 'Dirty Old Egg-Sucking Dog',
        spotifyUri: 'spotify:track:5lhM6HaQVXfbP7Gz8sOWwF',
        durationMs: 93000
      },
      {
        id: '11',
        title: 'Flushed from the Bathroom of Your Heart',
        spotifyUri: 'spotify:track:3sMhBOvW5OKkZO5jfnCFal',
        durationMs: 110000
      },
      {
        id: '12',
        title: 'Jackson',
        spotifyUri: 'spotify:track:3fCJrfwYu8GGq0wvOkmUSO',
        durationMs: 169000
      },
      {
        id: '13',
        title: 'Give My Love to Rose',
        spotifyUri: 'spotify:track:0YBRjhEoZPFXb2n5T0UGQY',
        durationMs: 169000
      },
      {
        id: '14',
        title: 'I Got Stripes',
        spotifyUri: 'spotify:track:6EMrwRrZkm9U3xrwSG6JjG',
        durationMs: 128000
      },
      {
        id: '15',
        title: 'Green, Green Grass of Home',
        spotifyUri: 'spotify:track:1xqUcNFzBHVRFLp2KrMWUG',
        durationMs: 180000
      },
      {
        id: '16',
        title: 'Greystone Chapel',
        spotifyUri: 'spotify:track:4H8aRGTy0O8GlExFwJ0Ozm',
        durationMs: 379000
      }
    ]
  },
  {
    id: 'talking-heads-stop-making-sense-1983',
    title: 'Stop Making Sense',
    artist: 'Talking Heads',
    venue: 'Pantages Theatre',
    date: 'December 1983',
    location: 'Hollywood, CA',
    attendance: 2800,
    description: "Filmed over three nights, Stop Making Sense captures Talking Heads at their artistic peak. David Byrne's iconic big suit and the band's innovative stage production set new standards for concert films and live performances.",
    posterImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    venueImage: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=1600&q=80',
    setlist: [
      {
        id: '1',
        title: 'Psycho Killer',
        spotifyUri: 'spotify:track:2nSE7RrvCT1qZK6kUZzTwR',
        durationMs: 293000
      },
      {
        id: '2',
        title: 'Heaven',
        spotifyUri: 'spotify:track:6uqPH2CbGQfBHsDBDaLtyS',
        durationMs: 234000
      },
      {
        id: '3',
        title: 'Thank You for Sending Me an Angel',
        spotifyUri: 'spotify:track:36waxHmN6VgVFGe5sZjpQy',
        durationMs: 135000
      },
      {
        id: '4',
        title: 'Found a Job',
        spotifyUri: 'spotify:track:78eFSZFV0PuzBZDCxqbQvQ',
        durationMs: 305000
      },
      {
        id: '5',
        title: 'Slippery People',
        spotifyUri: 'spotify:track:1hKPmE1w6xwj4kJKWQK18Y',
        durationMs: 319000
      },
      {
        id: '6',
        title: 'Burning Down the House',
        spotifyUri: 'spotify:track:6YqcVMNBBBKFsKPH6cY8Gb',
        durationMs: 238000
      },
      {
        id: '7',
        title: 'Life During Wartime',
        spotifyUri: 'spotify:track:5DW7kYgOBZzjfwE4sXu0oL',
        durationMs: 335000
      },
      {
        id: '8',
        title: 'Making Flippy Floppy',
        spotifyUri: 'spotify:track:0NubbwlcBYaWL1OkQajPfb',
        durationMs: 283000
      },
      {
        id: '9',
        title: 'Swamp',
        spotifyUri: 'spotify:track:4ycpYLK8xADQSp1hAjJGKn',
        durationMs: 312000
      },
      {
        id: '10',
        title: 'What a Day That Was',
        spotifyUri: 'spotify:track:74HkOJzlXrmfcsgXPmBJ5u',
        durationMs: 323000
      },
      {
        id: '11',
        title: 'Naive Melody (This Must Be the Place)',
        spotifyUri: 'spotify:track:6k4bG0X2BMU2mCvpxmwJKE',
        durationMs: 292000
      },
      {
        id: '12',
        title: 'Once in a Lifetime',
        spotifyUri: 'spotify:track:22WvfqSVG7hHzwqxOjTfkK',
        durationMs: 281000
      },
      {
        id: '13',
        title: 'Genius of Love',
        spotifyUri: 'spotify:track:0xAV2lh3hHO5RX67qskPbx',
        durationMs: 299000
      },
      {
        id: '14',
        title: 'Girlfriend Is Better',
        spotifyUri: 'spotify:track:6v49xRDg9F5WUWMr97c5U4',
        durationMs: 291000
      },
      {
        id: '15',
        title: 'Take Me to the River',
        spotifyUri: 'spotify:track:2GyuZ4j5L3hOwn9Lro5xdG',
        durationMs: 350000
      },
      {
        id: '16',
        title: 'Crosseyed and Painless',
        spotifyUri: 'spotify:track:7IUU4TiLBbBBKbQfCgGSPt',
        durationMs: 286000
      }
    ]
  },
  {
    id: 'the-last-waltz-1976',
    title: 'The Last Waltz',
    artist: 'The Band',
    venue: 'Winterland Ballroom',
    date: 'November 25, 1976',
    location: 'San Francisco, CA',
    attendance: 5000,
    description: "The Band's farewell concert featured an incredible lineup of guest artists including Bob Dylan, Eric Clapton, Neil Young, and Joni Mitchell. Directed by Martin Scorsese, the concert film became one of the most acclaimed music documentaries ever made.",
    posterImage: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&q=80',
    venueImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&q=80',
    setlist: [
      {
        id: '1',
        title: 'Up on Cripple Creek',
        spotifyUri: 'spotify:track:2PzU4IB8Dr6mxV3lHuaG34',
        durationMs: 286000
      },
      {
        id: '2',
        title: 'The Shape I\'m In',
        spotifyUri: 'spotify:track:5w8RKmJQxhJqJBdTlBBQBP',
        durationMs: 240000
      },
      {
        id: '3',
        title: 'It Makes No Difference',
        spotifyUri: 'spotify:track:7tG4Zs5MSlqEJFbBTd9fvi',
        durationMs: 388000
      },
      {
        id: '4',
        title: 'Life Is a Carnival',
        spotifyUri: 'spotify:track:6wy2T9V0mGHIhWJbWTQGsG',
        durationMs: 255000
      },
      {
        id: '5',
        title: 'This Wheel\'s on Fire',
        spotifyUri: 'spotify:track:0OdTbVQwzI2VLuSC1zk8G0',
        durationMs: 201000
      },
      {
        id: '6',
        title: 'The Weight',
        spotifyUri: 'spotify:track:4HNyJ7tlEPq05ITr5975Q3',
        durationMs: 275000
      },
      {
        id: '7',
        title: 'The Night They Drove Old Dixie Down',
        spotifyUri: 'spotify:track:2Gs91XjWcstBuKFEAKZvOE',
        durationMs: 215000
      },
      {
        id: '8',
        title: 'Stage Fright',
        spotifyUri: 'spotify:track:5I2m2AHevPLmzYf4fWTtIa',
        durationMs: 184000
      },
      {
        id: '9',
        title: 'Coyote',
        spotifyUri: 'spotify:track:0U6cLOHsnq6Q0GmHhU3B3N',
        durationMs: 297000
      },
      {
        id: '10',
        title: 'Dry Your Eyes',
        spotifyUri: 'spotify:track:4yvJbFbhEq6Wg5F1Yvt1vx',
        durationMs: 209000
      },
      {
        id: '11',
        title: 'I Shall Be Released',
        spotifyUri: 'spotify:track:34HE5wQBV0yvZxJ7BkGhiC',
        durationMs: 312000
      },
      {
        id: '12',
        title: 'Forever Young',
        spotifyUri: 'spotify:track:6MH9yPXnDp6gVPZuJ0cHPu',
        durationMs: 297000
      }
    ]
  }
];
