import { Fragment, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/application';
import { useSwipeable } from 'react-swipeable';
import * as api from '../utils/api';
import { alphaGroup } from '../utils';
import Loading from '../components/loading';
import Track from '../components/track';
import MetaData from '../components/metaData';
import Breadcrumbs from '../components/breadcrumbs';
import Album from '../components/album';
import Player from '../components/player';
import ErrorMessage from '../components/errorMessage';

export default function Home() {
	const params = useParams();
	const { appState, appAction, updateAppState } = useAppContext();

	const [loaded, setLoaded] = useState(false);
	const [artists, setArtists] = useState();
	const [artistGroups, setArtistGroups] = useState();
	const [list, setList] = useState();
	const [meta, setMeta] = useState();
	const [playlist, setPlaylist] = useState(false);
	const [filter, setFilter] = useState('');
	const [subFolder, setSubFolder] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		if (!artists) {
			api.browse().then((response) => {
				if (response && response.ok) {
					setLoaded(true);
					setArtists(response.folders);
					setArtistGroups(alphaGroup(response.folders));

				} else {
					updateAppState({ error: 'Sorry, there has been an error. Failed to load artists.'});
				}
			});
		}

		const urlPath = params['*'];

		if (urlPath) {
			loadArtist(urlPath);

		} else {
			reset();
			setLoaded(true);
			sideToggle(true);
		}
	// eslint-disable-next-line
	}, [params]);

	useEffect(() => {
		// selected folder only contains more folders
		if (list && !list.albums.length && !list.files.length && list.folders.length) {
			setSubFolder(list.path);
			setArtistGroups(alphaGroup(list.folders));
			sideToggle(true);
		}
	}, [list]);

	const reset = () => {
		setLoaded(false);
		setMeta();
		setList();
		updateAppState({ currentArtist: '', error: false });
	}

	const loadArtist = (path) => {
		reset();
		checkSideBar();

		api.browse(path).then((response) => {
			if (response && response.ok) {
				setLoaded(true);
				setList(response);
				updateAppState({
					playerState: 'min',
					currentArtist: path
				});

			} else {
				updateAppState({ error: 'Sorry, there has been an error. Failed to load '+ path +'.' });
			}
		});
	}

	const checkSideBar = () => {
		// below desktop breakpoint, close sidebar
		if (window.innerWidth < 700) {
			appAction.toggleMenu(false);
		}
	}

	const loadList = (path) => {
		reset();
		api.browse(path).then((response) => {
			setLoaded(true);
			appAction.toggleMenu(false);

			if (response.ok) {
				setList(response);

			} else {
				setList();
			}

			const mainDiv = document.getElementById('main-panel');
			mainDiv.scrollTop = 0;

			if (response.meta) {
				setMeta(response.meta);

			} else {
				setMeta();
			}
		});
	}

	const loadRandomAlbums = () => {
		reset();
		api.getRandomAlbums(10).then((response) => {
			checkSideBar();
			updateAppState({ playerState: 'min' });
			setLoaded(true);
			setList({
				type: 'random',
				path: 'Random Albums',
				albums: response.result,
				folders: [],
				files: []
			});
		});
	}

	const loadRandomTracks = () => {
		reset();
		api.getRandomTracks(20).then((response) => {
			checkSideBar();
			updateAppState({ playerState: 'min' });
			setLoaded(true);
			setList(response);
		});
	}

	const sideToggle = (bool) => {
		appAction.toggleMenu(bool);
	}

	const loadPlaylist = (index) => {
		setPlaylist({ path: list.path, songs: list.files, index: index });
		updateAppState({ playerState: 'min', loaded: false });
	}

	const doFilter = (e) => {
		const q = e.currentTarget.value.trimStart();
		setFilter(q);

		let results = [];

		artists.forEach((item) => {
			if (item.toLowerCase().indexOf(q.trim().toLowerCase()) > -1) {
				results.push(item);
			}
		});

		setArtistGroups(alphaGroup(results));
	}

	const clearFilter = () => {
		setFilter('');
		setArtistGroups(alphaGroup(artists));
		document.getElementById('field-filter').focus();
	}

	const clearCache = () => {
		api.clearCache()
			.then(resp => {
				// trigger a media reload
				console.log(resp);
			});
	}


	const swipeHandlers = useSwipeable({
		delta: 100,
		swipeDuration: 500,

		onSwipedLeft: () => {
			sideToggle(false);
		},

		onSwipedRight: () => {
			sideToggle(true);
		}
	});

	const isCurrent = (item) => {
		if (appState.currentArtist === item) {
			return { className: 'is-current' };
		}

		return false;
	}

	const resetArtists = () => {
		setArtistGroups(alphaGroup(artists));
		setSubFolder(false);
		navigate('/');
	}

	return (
		<div id="page-home">
			<div id="music-browser" {...swipeHandlers} className={appState.playerState === 'open' ? 'is-fixed' : ''}>
				<div id="side-panel" className={appState.menuOpen ? 'is-open' : ''}>
					{ artistGroups &&
						<Fragment>
							<div id="artist-filter">
								{ subFolder ? (
										<div className="btn-return" onClick={resetArtists}>Return to main</div>

									) : (

										<>
											<input type="text" id="field-filter" value={filter} maxLength="30" onChange={doFilter} placeholder="Find in Artists" />
											{ filter &&	<button type="button" className="btn-clear" onClick={clearFilter}>Clear</button> }
										</>
									)
								}
							</div>

							<div id="artist-list">
								{
									artistGroups.map((group) => {
										return (
											<div className="artist-group" key={group.letter}>
												<h4>{group.letter}</h4>
												<ul>
													{
														group.items.map((item, index) => {
															const link = subFolder ? `/${subFolder}/${item}` : `/${item}`;
															return <li key={item+index} {...isCurrent(item)}><Link to={link}>{item}</Link></li>
														})
													}
												</ul>
											</div>
										)
									})
								}
							</div>
							<div id="buttons">
								<button type="button" title="Random Albums" className="btn-random-albums" onClick={loadRandomAlbums}>Random Albums</button>
								<button type="button" title="Random Tracks" className="btn-random-tracks" onClick={loadRandomTracks}>Random Tracks</button>
								<button type="button" title="Clear the Cache" className="btn-clear-cache" onClick={clearCache}>Clear the Cache</button>
							</div>
						</Fragment>
					}
				</div>

				<div id="main-panel" className={appState.menuOpen ? 'is-open' : ''}>
					{ !loaded &&
						<Loading />
					}

					{ (list && list.path) &&
						<Breadcrumbs path={list.path} loadList={loadList} />
					}

					{ meta &&
						<MetaData data={meta} />
					}

					{ (loaded && !list) &&
						<div className="logo home">MusicBin</div>
					}

					{ (list && !list.files.length && !list.folders.length && !list.albums.length) &&
						<Fragment>
							<h4>This folder doesn&apos;t contain any valid music files.</h4>
							{ (list.unsupported.length > 0) &&
								<Fragment>
									<p>(But there are unsupported files)</p>
									<ul>
									{ list.unsupported.map((item, index) => {
										return <li key={item+index}>{item}</li>
									})}
									</ul>
								</Fragment>
							}
						</Fragment>
					}

					{ (list && list.albums.length > 0) &&
						<div className="album-list">
							{ list.albums.map((item, index) => {
								return <Album key={item+index} item={item} showArtist={list.type === 'random' ? true : false} onClick={() => { loadList(item.path) }} />
							})}
						</div>
					}

					{ (list && list.files.length > 0) &&
						<ul className="track-list">
							{ list.files.map((item, index) => {
								return <li key={item+index} onClick={() => { loadPlaylist(index) }}><Track num={index+1} total={list.files.length} item={item} /></li>
							})}
						</ul>
					}
				</div>

				{ playlist &&
					<Player playlist={playlist} loadList={loadList} />
				}
			</div>
			<ErrorMessage />
		</div>
	);
}
