import { authorize } from '@liveblocks/node'
import { NextApiRequest, NextApiResponse } from 'next'

const API_KEY = process.env.LIVEBLOCKS_SECRET_KEY

export default async function auth (req: NextApiRequest, res: NextApiResponse) {
  if (!API_KEY) {
    return res.status(403).end()
  }

  const randomPicture = Math.floor(Math.random() * 10)

  // For the avatar example, we're generating random users
  // and set their info from the authentication endpoint
  // See https://liveblocks.io/docs/api-reference/liveblocks-node#authorize for more information
  const response = await authorize({
    room: req.body.room,
    secret: API_KEY,
    userInfo: {
      name: NAMES[Math.floor(Math.random() * NAMES.length)],
      picture: `/assets/avatars/${randomPicture}.png`,
      color: COLORS[randomPicture]
    }
  })
  return res.status(response.status).end(response.body)
}

const COLORS = [
  '#00c471',
  '#ff1bcc',
  '#fd7214',
  '#fd2929',
  '#7e63ff',
  '#00c0a6',
  '#d0b901',
  '#4678ff',
  '#ec01da',
  '#7bd203',
  '#02c6cb',
]

/*
const COLORS = [
  '#96ffd2',
  '#ffb9f0',
  '#ffba8c',
  '#f68e8e',
  '#c6bbff',
  '#a9fff5',
  '#faed5f',
  '#a1bbff',
  '#ffa6f7',
  '#e1ffb5',
  '#6bf5fa',
]

 */

const NAMES = [
  'Charlie Layne',
  'Mislav Abha',
  'Tatum Paolo',
  'Anjali Wanda',
  'Jody Hekla',
  'Emil Joyce',
  'Jory Quispe',
  'Quinn Elton'
]
