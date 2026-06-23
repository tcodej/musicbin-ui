import { Fragment, useEffect, useState } from 'react';
import { useAppContext } from '../contexts/application';
import Cover from './cover';

export default function MetaData({ data }) {
	const { appState } = useAppContext();
	const [ meta, setMeta ] = useState();

	useEffect(() => {
		if (data) {
			setMeta(data);
		}
	}, [data]);

	// uncomment this to allow the thumbnail to update when a track changes
	// useEffect(() => {
	// 	if (appState.currentTrack) {
	// 		setMeta(appState.currentTrack.meta);
	// 	}
	// }, [appState.currentTrack]);

	return (
		<Fragment>
			{ meta &&
				<div id="artist-album">
					<Cover meta={meta} />

					<div className="meta">
						{ meta.album &&
							<div className="album-name">{meta.album}</div>
						}
						{ meta.artist &&
							<div className="artist-name">{meta.artist}</div>
						}
						{ meta.year && meta.genre ? (
							<div className="small">{meta.genre.join('/')} - {meta.year}</div>

						) : (
							<Fragment>
								{ meta.year &&
									<div className="small">{meta.year}</div>
								}
								{ meta.genre &&
									<div className="small">{meta.genre.join('/')}</div>
								}
							</Fragment>
						)}
					</div>
				</div>
			}
		</Fragment>
	);
}
