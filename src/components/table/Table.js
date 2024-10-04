import React, { useEffect, useRef, useState } from 'react';
import './Table.css';

const Table = ({ onPredictions }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [inferEngine, setInferEngine] = useState(null);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [workerId, setWorkerId] = useState(null);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');

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
        const predictFrame = async () => {
            if (inferEngine && workerId && videoRef.current && canvasRef.current && videoLoaded) {
                try {
                    const img = new window.inferencejs.CVImage(videoRef.current);
                    const predictions = await inferEngine.infer(workerId, img);

                    onPredictions(predictions);

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
                } catch (error) {
                    console.error("Error predicting frame:", error);
                }
            }

            requestAnimationFrame(predictFrame);
        };

        predictFrame();
    }, [inferEngine, workerId, videoLoaded, onPredictions]);

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
