import { Fragment, useState, useEffect } from 'react';
import {
	BrowserRouter,
	Routes,
	Route
} from 'react-router-dom';
import { ApplicationProvider } from './contexts/application';
import Passcode from './components/passcode';
import Header from './components/header';
import Home from './views/home';
import './assets/styles/main.scss';

export default function App() {
	const [authenticated, setAuthenticated] = useState(false);

	useEffect(() => {
		if (!authenticated) {
			if (sessionStorage.getItem('authenticated')) {
				setAuthenticated(true);
			}
		}
	}, [authenticated]);

	const unlock = () => {
		setAuthenticated(true);
	}

	return (
		<ApplicationProvider>
			<BrowserRouter basename="/">
			{ authenticated ?
				<Fragment>
					<Header />
					<div id="container">
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/*" element={<Home />} />
						</Routes>
					</div>
				</Fragment>
			:
				<Passcode onUnlock={unlock} />
			}
			</BrowserRouter>
		</ApplicationProvider>
	)
}
