import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";

export const createServer = (): Express => {
	const app = express();
	app
		.disable("x-powered-by")
		.use(morgan("dev"))
		.use(urlencoded({ extended: true }))
		.use(json())
		.use(cors())
		.get("/message/:name", (req, res) => {
			return res.json({ message: `hello ${req.params.name}` });
		})
		.get("/status", (_, res) => {
			return res.json({ ok: true });
		});
	// The streaming endpoint
	app.get("/api/stream", (req, res) => {
		// 1. Set the headers for SSE
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.flushHeaders(); // Flush the headers to establish the connection

		const textToStream =
			"Hello, frontend developer! This is streamed text. Each word is a chunk sent from the server, making the user experience much more interactive and engaging. Isn't this cool?";
		const words = textToStream.split(" ");
		let wordIndex = 0;

		const intervalId = setInterval(() => {
			if (wordIndex >= words.length) {
				clearInterval(intervalId);
				res.end(); // 3. Close the connection when done
				return;
			}

			const word = words[wordIndex];
			// 2. Write each chunk of data in the 'data: ...\n\n' format
			res.write(`data: ${word} \n\n`);
			wordIndex++;
		}, 150); // Send a new word every 150ms

		// If the client closes the connection, stop sending events
		req.on("close", () => {
			clearInterval(intervalId);
			res.end();
		});
	});

	return app;
};
