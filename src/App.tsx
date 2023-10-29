import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Motion } from "./Motion";
import { Presence } from "./Presence";

function App() {
	const [count, setCount] = useState(0);
	const [show, setShow] = useState(false);

	const animateOptions = { opacity: count / 5 };

	setInterval(() => {
		console.log("Here!");
		setShow(show => !show);
	}, 1000);
	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<Presence>
					{show && (
						<Motion.div key="test" initial={{ opacity: 0.1 }}>
							<TestButton />
						</Motion.div>
					)}
				</Presence>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</>
	);
}

const TestButton = () => {
	const [count, setCount] = useState(0);

	return (
		<button onClick={() => setCount(count => count + 1)}>
			count is {count}
		</button>
	);
};

export default App;
