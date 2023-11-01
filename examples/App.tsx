import { useState } from "react";
import "./App.css";
import { Motion } from "../src/Motion";
import { Presence } from "../src/Presence/presence";

function App() {
	const [show, setShow] = useState(false);
	const [count, setCount] = useState(0);

	return (
		<>
			<h1>Vite + React</h1>
			<div className="card">
				<button
					onClick={() => {
						setShow(show => !show);
						setCount(count => count + 1);
					}}>
					{!show ? "Show" : "Hide"} {count} !exitBeforeEnter
				</button>
				<Presence>
					<Motion.button
						key="test1"
						initial={{ opacity: 0.1 }}
						animate={{ opacity: 0.5 }}
						hover={{ opacity: 0.7 }}
						press={{ opacity: 1 }}
						onClick={() => setCount(count => count + 1)}>
						count is {count}
					</Motion.button>
					{show && (
						<Motion.button
							key="test2"
							initial={{ opacity: 0.1 }}
							exit={{ opacity: 0, transition: { duration: 3 } }}
							onClick={() => setCount(count => count + 1)}>
							count is {count} test2 (when 'Hide')
						</Motion.button>
					)}
					<Motion.div key="test3">
						<TestButton />
					</Motion.div>
					{show && (
						<Motion.div key="test4">
							<TestButton />
						</Motion.div>
					)}
					{!show && (
						<Motion.button
							key="test5"
							initial={{ opacity: 0.1 }}
							exit={{ opacity: 0, transition: { duration: 3 } }}
							onClick={() => setCount(count => count + 1)}>
							count is {count} test3 (when 'Show')
						</Motion.button>
					)}
					<Motion.div key="test6">
						<TestButton />
					</Motion.div>
				</Presence>
			</div>
			<div className="card">
				<button
					onClick={() => {
						setShow(show => !show);
						setCount(count => count + 1);
					}}>
					{!show ? "Show" : "Hide"} {count} exitBeforeEnter
				</button>
				<Presence exitBeforeEnter>
					<Motion.button
						key="test1"
						initial={{ opacity: 0.1 }}
						onClick={() => setCount(count => count + 1)}>
						count is {count}
					</Motion.button>
					{show && (
						<Motion.button
							key="test2"
							initial={{ opacity: 0.1 }}
							exit={{ opacity: 0, transition: { duration: 3 } }}
							onClick={() => setCount(count => count + 1)}>
							count is {count} test2 (when 'Hide')
						</Motion.button>
					)}
					<Motion.div key="test3">
						<TestButton />
					</Motion.div>
					{show && (
						<Motion.div key="test4">
							<TestButton />
						</Motion.div>
					)}
					{!show && (
						<Motion.button
							key="test5"
							initial={{ opacity: 0.1 }}
							exit={{ opacity: 0, transition: { duration: 3 } }}
							onClick={() => setCount(count => count + 1)}>
							count is {count} test3 (when 'Show')
						</Motion.button>
					)}
					<Motion.div key="test6">
						<TestButton />
					</Motion.div>
				</Presence>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
		</>
	);
}

const TestButton = () => {
	const [count, setCount] = useState(0);

	return (
		<button onClick={() => setCount(count => count + 1)}>
			count is {count} !!
		</button>
	);
};

export default App;
