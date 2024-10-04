import React, { useEffect, useRef, useState, useCallback } from 'react';
import './Table.css';

const CONFIDENCE_THRESHOLD = 0.5;

const Table = ({ onPredictions }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [inferEngine, setInferEngine] = useState(null);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [workerId, setWorkerId] = useState(null);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const lastDetectTimeRef = useRef(0);
    const detectFrameRef = useRef(null);

    const detectFrame = useCallback(async () => {
        if (!inferEngine || !workerId || !videoRef.current || !canvasRef.current || !videoLoaded) {
            return;
        }

        const now = Date.now();
        if (now - lastDetectTimeRef.current < 250) { // Limit to 4 times per second
            return;
        }
        lastDetectTimeRef.current = now;

        try {
            const img = new window.inferencejs.CVImage(videoRef.current);
            let predictions = await inferEngine.infer(workerId, img);

            // Sort predictions by confidence and remove duplicates
            predictions = predictions
                .sort((a, b) => b.confidence - a.confidence)
                .filter((pred, index, self) =>
                    index === self.findIndex((t) => t.class === pred.class) && pred.confidence >= CONFIDENCE_THRESHOLD
                );

            // Divide predictions into 3 zones
            const canvasWidth = canvasRef.current.width;
            const zoneWidth = canvasWidth / 3;
            const zonedPredictions = [null, null, null];

            predictions.forEach(pred => {
                const zoneIndex = Math.floor(pred.bbox.x / zoneWidth);
                if (zoneIndex >= 0 && zoneIndex < 3 && !zonedPredictions[zoneIndex]) {
                    zonedPredictions[zoneIndex] = pred;
                }
            });

            onPredictions(zonedPredictions);
            renderPredictions(zonedPredictions);

        } catch (error) {
            console.error("Error predicting frame:", error);
        }
    }, [inferEngine, workerId, videoLoaded, onPredictions]);

    useEffect(() => {
        detectFrameRef.current = detectFrame;
    }, [detectFrame]);

    useEffect(() => {
        const setupInference = async () => {
            const engine = new window.inferencejs.InferenceEngine();
            setInferEngine(engine);

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
        const getVideoDevices = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
            if (videoDevices.length > 0) {
                setSelectedDeviceId(videoDevices[0].deviceId);
            }
        };

        getVideoDevices();
    }, []);

    useEffect(() => {
        const setupWebcam = async () => {
            if (selectedDeviceId) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: selectedDeviceId } }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        setVideoLoaded(true);
                    };
                }
            }
        };

        setupWebcam();
    }, [selectedDeviceId]);

    useEffect(() => {
        let animationFrameId;

        const animationLoop = () => {
            detectFrameRef.current();
            animationFrameId = requestAnimationFrame(animationLoop);
        };

        console.log("Starting prediction loop");
        animationLoop();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);

    const renderPredictions = (predictions) => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const colors = ['#FF0000', '#00FF00', '#0000FF'];
        const canvasWidth = canvasRef.current.width;
        const canvasHeight = canvasRef.current.height;
        const zoneWidth = canvasWidth / 3;

        // Draw zone dividers
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(zoneWidth, 0);
        ctx.lineTo(zoneWidth, canvasHeight);
        ctx.moveTo(zoneWidth * 2, 0);
        ctx.lineTo(zoneWidth * 2, canvasHeight);
        ctx.stroke();

        predictions.forEach((pred, index) => {
            if (pred) {
                const color = colors[index];
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.strokeRect(pred.bbox.x, pred.bbox.y, pred.bbox.width, pred.bbox.height);
                ctx.fillStyle = color;
                ctx.fillText(`${pred.class} ${pred.confidence.toFixed(2)}`, pred.bbox.x, pred.bbox.y - 5);
            }
        });
    };

    const handleDeviceChange = (event) => {
        setVideoLoaded(false);
        setSelectedDeviceId(event.target.value);
    };

    return (
        <div className="table-container">
            <div className="camera-select-overlay">
                <select value={selectedDeviceId} onChange={handleDeviceChange}>
                    {devices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${devices.indexOf(device) + 1}`}
                        </option>
                    ))}
                </select>
            </div>
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
