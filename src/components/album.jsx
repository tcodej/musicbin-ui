import { Fragment, useState, useEffect } from 'react';
import Cover from './cover';

export default function Album({ item, onClick, showArtist }) {

  // check for folder format YYYY - Album Title
  const folder = item.path.split('/').pop();
  const [full, first, second] = folder.split(/(^[12]\d{3}) - /);

  if (item.isFolder) {
    if (full) {
      item.album = full;
    }

    if (first) {
      item.year = first;
    }

    if (second) {
      item.album = second;
    }
  }

  // prefer folder year if it doesn't match 1st mp3 meta year
  if (first) {
    if (item.year !== first) {
      item.year = first;
    }
  }

  return (
    <div className="album" onClick={onClick}>
      <Cover meta={item} />
      <div className="title">{item.album}</div>
      {showArtist && 
        <div className="artist">{item.artist}</div>
      }
      {item.year &&
        <div className="year">{item.year}</div>
      }
    </div>
  )
}
