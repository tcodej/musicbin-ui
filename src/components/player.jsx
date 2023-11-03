import { Fragment, useEffect, useState, useRef } from 'react';
import { useAppContext } from '../contexts/application';
import { useSwipeable } from 'react-swipeable';
import { getMeta } from '../utils/api';
import { formatTime } from '../utils';
import Slider from './slider';
import Cover from './cover';
import mp3Icon from '../assets/img/icon-mp3.svg';

export default function Player({ playlist }) {
	const { appState, updateAppState } = useAppContext();
	const [ listenersAdded, setListenersAdded ] = useState(false);
	const [ song, setSong ] = useState(false);
	const [ state, setState ] = useState({
		playing: false,
		duration: 0,
		currentTime: 0,
		remainingTime: 0,
		volume: 0.05
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

	const updateIndex = (newIndex) => {
		if (newIndex < 0 || newIndex > playlist.songs.length - 1) {
			return
		}

		playlist.index = newIndex;
		playAudio(playlist.path +'/'+ playlist.songs[playlist.index]);
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
		updateState({ playing: true });
	}

	const stop = () => {
		player.current.pause();
		updateState({ playing: false });
	}

	const togglePlay = () => {
		if (state.playing) {
			stop();

		} else {
			play();
		}
	}

	const handlePlay = () => {
		// temporary
		player.current.volume = state.volume;
	}

	const handleCanPlay = () => {
		// because autoplay is enabled
		updateState({ playing: true });
	}

	const handleDurationChange = () => {
		const playerDuration = parseInt(getDuration(), 10);

		updateState({
			duration: playerDuration
		});
	}

	const handleTimeUpdate = () => {
		if (!player.current) {
			return;
		}

		updateState({
			currentTime: formatTime(player.current.currentTime)
		});

		updateProgress();
	}

	const updateProgress = (value) => {
		if (Array.isArray(value)) {
			value = value[0];
		}

		if (player.current.seeking) {
			return;
		}

		let progress = player.current.currentTime;

		if (value) {
			progress = value;
			player.current.currentTime = progress;
		}

		const remainingTime = getDuration() - progress;

		updateState({
			progress: progress,
			remainingTime: `-${formatTime(remainingTime)}`
		});
	}

	const setVolume = (value) => {
		if (Array.isArray(value)) {
			value = value[0];
		}

		player.current.volume = value;
		updateState({ volume: player.current.volume });
	}

	const handleEnded = () => {
		console.log('ended', playlist.index);
		nextTrack();
	}

	const nextTrack = () => {
		console.log('next track');
		updateIndex(playlist.index + 1);
	}

	const prevTrack = () => {
		console.log('prev track');
		updateIndex(playlist.index - 1);
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

	const playAudio = (path) => {
		getMeta(path).then((response) => {
			setSong(response);
			updateAppState({ currentTrack: path });
		});
	}

	const seek = (value) => {
		if (Array.isArray(value)) {
			value = value[0];
		}

		if (state.playing) {
			player.current.currentTime = value;
		}
	}

	useEffect(() => {
		// console.log('playlist', playlist);
		if (playlist.songs[playlist.index]) {
			playAudio(playlist.path +'/'+ playlist.songs[playlist.index]);
		}
	}, [playlist]);

	useEffect(() => {
		if (song) {
			if (!song.mp3) {
				return;
			}

			if (!listenersAdded) {
				setListenersAdded(true);
				player.current.addEventListener('play', handlePlay);
				player.current.addEventListener('canplay', handleCanPlay);
				player.current.addEventListener('durationchange', handleDurationChange);
				player.current.addEventListener('timeupdate', handleTimeUpdate);
				player.current.addEventListener('ended', handleEnded);
			}

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

				navigator.mediaSession.setActionHandler('play', () => {
					play();
				});
 
				navigator.mediaSession.setActionHandler('pause', () => {
					stop();
				});
 
				navigator.mediaSession.setActionHandler('stop', () => {
					stop();
				});
 
				navigator.mediaSession.setActionHandler('previoustrack', () => {
					prevTrack();
				});

				navigator.mediaSession.setActionHandler('nexttrack', () => {
					nextTrack();
				});

				navigator.mediaSession.setActionHandler('seekto', (e) => {
					seek(e.seekTime);
				});
			}
		}
	// eslint-disable-next-line
	}, [song]);

	return (
		<div id="player-panel" className={appState.playerState} {...swipeHandlers}>
			{ song &&
				<Fragment>
					<div className="song-info" onClick={() => updateAppState({ playerState: 'open' })}>
						<Cover meta={song} />
						{ song.title &&	<div className="title">{song.title}</div> }
						{ song.artist && <div className="artist">{song.artist}</div> }
					</div>
					<div className="time">
						<Slider
							min={0}
							max={state.duration}
							step={0.001}
							value={[state.progress]}
							onValueChange={updateProgress}
							onValueCommit={seek}
						/>
						<div className="minutes">
							<div className="current">{state.currentTime}</div>
							<div className="duration">{state.remainingTime}</div>
						</div>
					</div>
					<div className="controls">
						<button type="button" className="prev" onClick={prevTrack}>Prev</button>
						<button type="button" className={ 'playpause'+ (state.playing ? ' is-playing' : '') } onClick={togglePlay}>Play</button>
						<button type="button" className="next" onClick={nextTrack}>Next</button>
					</div>
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
				</Fragment>
			}

			<audio src={song.mp3} ref={player} autoPlay />
		</div>
	);
}
