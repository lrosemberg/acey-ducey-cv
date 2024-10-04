import React, { useEffect, useRef, useState } from 'react';
import './Table.css';

const Table = ({ onPredictions }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [inferEngine, setInferEngine] = useState(null);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [workerId, setWorkerId] = useState(null);

    useEffect(() => {
        const setupInference = async () => {
            const engine = new window.inferencejs.InferenceEngine();
            setInferEngine(engine);

            // const configuration = { scoreThreshold: 0.5, iouThreshold: 0.5, maxNumBoxes: 20 };
            const worker = await engine.startWorker(
                "playing-cards-ow27d",
                4,
                "rf_8GkUwQp8xHdje53kITLTHZOYbzm2"
            );
            setWorkerId(worker);
        };

        setupInference();

        return () => {
            if (inferEngine && workerId) {
                inferEngine.stopWorker(workerId);
            }
        };
    }, []);

    useEffect(() => {
        const setupWebcam = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setVideoLoaded(true);
                };
            }
        };

        setupWebcam();
    }, []);

    useEffect(() => {
        const predictFrame = async () => {
            if (inferEngine && workerId && videoRef.current && canvasRef.current && videoLoaded) {
                const img = new window.inferencejs.CVImage(videoRef.current);
                const predictions = await inferEngine.infer(workerId, img);

                // Emit predictions using the React prop
                onPredictions(predictions);

                // Draw predictions on canvas
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
                predictions.forEach((pred, index) => {
                    const color = colors[index % colors.length];
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(pred.bbox.x, pred.bbox.y, pred.bbox.width, pred.bbox.height);
                    ctx.fillStyle = color;
                    ctx.fillText(`${pred.class} ${pred.confidence.toFixed(2)}`, pred.bbox.x, pred.bbox.y - 5);
                });
            }

            requestAnimationFrame(predictFrame);
        };

        predictFrame();
    }, [inferEngine, workerId, videoLoaded, onPredictions]);

    return (
        <div className="table-container">
            <video
                ref={videoRef}
                width="640"
                height="480"
                autoPlay
                playsInline
                muted
                className="table-video"
            />
            <canvas
                ref={canvasRef}
                width="640"
                height="480"
                className="table-canvas"
            />
        </div>
    );
};

export default Table;
