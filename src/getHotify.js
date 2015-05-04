import makeHotify from './makeHotify';

const hotifiers = {};

export default function getHotify(React, uniqueClassId) {
  if (!hotifiers[uniqueClassId]) {
    hotifiers[uniqueClassId] = makeHotify(React);
  }

  return hotifiers[uniqueClassId];
}