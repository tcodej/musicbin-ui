import { Fragment } from 'react';
import { useAppContext } from '../contexts/application';
import FakeAnim from './fakeAnim';

export default function Track({ num, total, item }) {
  const { appState } = useAppContext();

  // return a zero-padded track number
  const getNum = () => {
    return num.toString().padStart(total.toString().length, '0');
  }

  // return song title without track number based on filename i.e.
  // 03 - The Song Name.mp3 (preferred) or 03. The Song Name.mp3
  const getTrack = () => {
    // drop the track number
    const regex = /^\d{1,4} - |^\d{1,4}. /;
    let parts = item.split(regex);
    let title = '';
    let artist = '';
    let base = '';

    if (parts.length > 1) {
      parts.shift();
      base = parts.join('');
      title = base.substring(0, base.lastIndexOf('.'));

    } else {
      // handle random tracks that conatin the full path
      parts = item.split('/');
      if (parts[0] === '') {
        parts.shift();
      }
      const trackParts = parts.pop().split(regex);
      base = trackParts.pop();
      title = base.substring(0, base.lastIndexOf('.'));

      if (parts[0]) {
        artist = parts[0];
      }
    }

    if (artist) {
      return <Fragment>{title}<span className="artist"> - {artist}</span></Fragment>

    } else {
      return <Fragment>{title}</Fragment>
    }
  }

  const isCurrent = () => {
    // could return a false positive if another track exists with the exact same number+name
    if (appState.currentTrack && appState.currentTrack.path.indexOf(item) > -1) {
      return ' is-current';
    }

    return '';
  }

  const getAnim = () => {
    if (isCurrent()) {
      return <FakeAnim freeze={appState.playing ? false : true} />
    }
  }

  return (
    <div className={`track${isCurrent()}`}>
      <span>{getNum()}.</span>
      {getTrack()}
      {getAnim()}
    </div>
  );
}
