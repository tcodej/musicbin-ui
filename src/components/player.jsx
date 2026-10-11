import { Fragment, useEffect, useState, useRef } from 'react';
import { useAppContext } from '../contexts/application';
import { useSwipeable } from 'react-swipeable';
import { getMeta } from '../utils/api';
import { formatTime, getMobileOS } from '../utils';
import Slider from './slider';
import Cover from './cover';
import mp3Icon from '../assets/img/icon-mp3.svg';

let seeking = false;

export default function Player({ playlist, loadList }) {
  const { appState, updateAppState } = useAppContext();
  const [ song, setSong ] = useState(false);
  const [ state, setState ] = useState({
    duration: 0,
    currentTime: 0,
    remainingTime: 0,
    volume: 1,
    percent: 0
  });

  const player = useRef(null);

  const updateState = (newVals) => {
    setState((prevVals) => {
      return ({
        ...prevVals,
        ...newVals
      })
    });
  }

  const updateIndex = (dir) => {
    const newIndex = playlist.index + dir;

    if (newIndex < 0 || newIndex > playlist.songs.length - 1) {
      stop();
      setSong(false);
      updateAppState({
        currentArtist: '',
        currentTrack: '',
        playerState: null
      });

      return;
    }

    playlist.index = newIndex;
    playAudio(newIndex);
  }

  const swipeHandlers = useSwipeable({
    trackMouse: true,

    onSwipedDown: () => {
      updateAppState({ playerState: 'min' });
    },

    onSwipedUp: () => {
      updateAppState({ playerState: 'open' });
    }
  });

  const play = () => {
    player.current.play();
    updateAppState({ playing: true });
  }

  const stop = () => {
    player.current.pause();
    updateAppState({ playing: false });
  }

  const togglePlay = () => {
    if (appState.playing) {
      stop();

    } else {
      play();
    }
  }

  const handlePlay = () => {
    const vol = localStorage.getItem('musicbin_volume');
    setVolume(vol || 1);
  }

  const handleCanPlay = () => {
    // because autoplay is enabled
    updateAppState({ loaded: true, playing: true });
  }

  const handleDurationChange = () => {
    const playerDuration = parseInt(getDuration(), 10);

    updateState({
      duration: playerDuration
    });
  }

  const handleTimeUpdate = () => {
    if (!player.current || seeking) {
      return;
    }

    updateState({
      currentTime: formatTime(player.current.currentTime)
    });

    updateProgress();
  }

  // when dragging the progress slider
  const updateSlider = (value) => {
    seeking = true;

    if (Array.isArray(value)) {
      value = value[0];
    }

    const remainingTime = getDuration() - value;

    updateState({
      progress: value,
      currentTime: formatTime(value),
      remainingTime: `-${formatTime(remainingTime)}`
    });
  }

  const updateProgress = (value) => {
    if (seeking) {
      return;
    }

    if (Array.isArray(value)) {
      value = value[0];
    }

    let progress = player.current.currentTime;

    if (value) {
      progress = value;
      player.current.currentTime = progress;
    }

    const remainingTime = getDuration() - progress;

    // single line progress bar
    let percent = (progress / getDuration()) * 100;
    if (isNaN(percent)) {
      percent = 0;
    }

    updateState({
      progress: progress,
      remainingTime: `-${formatTime(remainingTime)}`,
      percent: percent
    });
  }

  // ios devices do not allow volume control
  const volumeAllowed = () => {
    if (getMobileOS()) {
      return false;
    }

    return true;
  }

  const setVolume = (value) => {
    if (Array.isArray(value)) {
      value = value[0];
    }

    localStorage.setItem('musicbin_volume', value);
    player.current.volume = value;
    updateState({ volume: player.current.volume });
  }

  const handleEnded = () => {
    nextTrack();
  }

  const nextTrack = () => {
    stop();
    updateAppState({ loaded: false });
    updateIndex(1);
  }

  const prevTrack = () => {
    stop();
    updateAppState({ loaded: false });
    updateIndex(-1);
  }

  const getDuration = () => {
    if (isNaN(player.current.duration)) {
      return 0;
    }

    return player.current.duration;
  }

  const getArtwork = (size) => {
    if (!song.image) {
      song.image = mp3Icon;
    }

    return {
      src: song.image,
      sizes: `${size}x${size}`,
      type: 'image/jpeg'
    }
  }

  const playAudio = (index) => {
    const path = playlist.path +'/'+ playlist.songs[index];

    getMeta(path).then((response) => {
      if (response.ok) {
        setSong(response);
        updateAppState({
          currentTrack: {
            path: path,
            meta: response
          }
        });

      } else {
        updateAppState({ error: 'Sorry, there has been an error. Failed to load audio.'});
      }
    });
  }

  const seek = (value) => {
    seeking = false;

    if (Array.isArray(value)) {
      value = value[0];
    }

    if (appState.playing) {
      player.current.currentTime = value;
    }
  }

  // load album page for this song or maximize if minimized
  const loadAlbum = () => {
    if (appState.playerState === 'min') {
      maximize();
      return;
    }

    if (typeof loadList === 'function') {
      updateAppState({ playerState: 'min' });

      // playlist.path is present for normal plays
      if (playlist.path) {
        loadList(playlist.path);

      } else {
        // random playlist songs contain the path
        const track = playlist.songs[playlist.index];
        const path = track.substring(0, track.lastIndexOf('/'));
        loadList(path);
      }
    }
  }

  const maximize = () => {
    if (appState.playerState === 'min') {
      updateAppState({ playerState: 'open' });
    }
  }

  useEffect(() => {
    playAudio(playlist.index);
    // eslint-disable-next-line
  }, [playlist]);

  useEffect(() => {
    if (song && song.mp3) {
      player.current.addEventListener('play', handlePlay);
      player.current.addEventListener('canplay', handleCanPlay);
      player.current.addEventListener('durationchange', handleDurationChange);
      player.current.addEventListener('timeupdate', handleTimeUpdate);
      player.current.addEventListener('ended', handleEnded);

      if ('mediaSession' in navigator) {
        const metaData = {
          title: song.title,
          artist: song.artist,
          album: song.album,
          artwork: [
            getArtwork(96),
            getArtwork(128),
            getArtwork(192),
            getArtwork(256),
            getArtwork(384),
            getArtwork(512)
          ]
        };

        navigator.mediaSession.metadata = new MediaMetadata(metaData);
        navigator.mediaSession.setActionHandler('play', play);
        navigator.mediaSession.setActionHandler('pause', stop);
        navigator.mediaSession.setActionHandler('stop', stop);
        navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
        navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
        navigator.mediaSession.setActionHandler('seekto', (e) => {
          seek(e.seekTime);
        });
      }
    }

    return () => {
      if (player && player.current) {
        player.current.removeEventListener('play', handlePlay);
        player.current.removeEventListener('canplay', handleCanPlay);
        player.current.removeEventListener('durationchange', handleDurationChange);
        player.current.removeEventListener('timeupdate', handleTimeUpdate);
        player.current.removeEventListener('ended', handleEnded);
      }
    }
  // eslint-disable-next-line
  }, [song]);

  return (
    <div
      id="player-panel"
      className={appState.playerState}
      {...swipeHandlers}
    >
      { song &&
        <Fragment>
          <div id="progress-bar"><div className="progress" style={{ width: `${state.percent}%` }} /></div>
          <Cover meta={song} onClick={loadAlbum} />
          <div className="player-info">
            <div className="song-info" onClick={maximize}>
              { song.title && <div className="title">{song.title}</div> }
              { song.artist && <div className="artist">{song.artist}</div> }
            </div>
            <div className="time">
              <Slider
                min={0}
                max={state.duration}
                step={0.001}
                value={[state.progress]}
                onValueChange={updateSlider}
                onValueCommit={seek}
              />
              <div className="minutes">
                <div>{state.currentTime}</div>
                <div className="track-count">{playlist.index+1}/{playlist.songs.length}</div>
                <div>{state.remainingTime}</div>
              </div>
            </div>
            <div className="controls">
              <button type="button" className="prev" onClick={prevTrack}>Prev</button>
              { appState.loaded ?
                <button type="button" className={ 'playpause'+ (appState.playing ? ' is-playing' : '') } onClick={togglePlay}>Play</button>
              :
                <button type="button" className="preload">Loading...</button>
              }
              <button type="button" className="next" onClick={nextTrack}>Next</button>
            </div>
            { volumeAllowed() &&
              <div className="volume">
                <div className="icon min">Min</div>
                <Slider
                  monochrome="true"
                  min={0}
                  max={1}
                  step={0.001}
                  value={[state.volume]}
                  onValueChange={setVolume}
                />
                <div className="icon max">Max</div>
              </div>
            }
            <div className="buttons">
              <button type="button" className="minimize" onClick={() => { updateAppState({ playerState: 'min' }) }}>Minimize</button>
              <button type="button" className="playlist" onClick={loadAlbum}>Playlist</button>
            </div>
          </div>
          <div className="background-container">
            <div className="background" style={{ backgroundImage: `url('${song.image}')` }} />
          </div>
        </Fragment>
      }

      <audio src={song.mp3} ref={player} autoPlay />
    </div>
  );
}
