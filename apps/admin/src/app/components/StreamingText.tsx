"use client";
import { useState, useCallback } from "react";

// CSS for the blinking cursor
const cursorStyle = `
  .blinking-cursor::after {
    content: '▋';
    display: inline-block;
    animation: blink 1s step-end infinite;
  }
  @keyframes blink {
    from, to { color: transparent; }
    50% { color: black; }
  }
`;

function StreamingComponent() {
	const [text, setText] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);

	const startStreaming = useCallback(async () => {
		setText("");
		setIsStreaming(true);

		try {
			const response = await fetch("http://localhost:5001/api/stream");

			if (!response.body) {
				throw new Error("ReadableStream not supported in this browser.");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n\n").filter(Boolean);
				for (const line of lines) {
					const message = line.replace(/^data: /, "");
					setText((prevText) => prevText + message);
				}
			}
		} catch (error) {
			console.error("Streaming failed:", error);
			setText("Failed to stream content.");
		} finally {
			setIsStreaming(false);
		}
	}, []);

	return (
		<div>
			<style>{cursorStyle}</style>
			<button
				onClick={startStreaming}
				disabled={isStreaming}>
				{isStreaming ? "Streaming..." : "Start Streaming"}
			</button>
			<div
				style={{
					background: "#f0f0f0",
					border: "1px solid #ccc",
					padding: "20px",
					fontFamily: "monospace",
					whiteSpace: "pre-wrap",
					minHeight: "100px",
				}}
				// Add the blinking cursor class only when streaming
				className={isStreaming ? "blinking-cursor" : ""}>
				{text}
			</div>
		</div>
	);
}

export default StreamingComponent;
