import { useState, useRef, useEffect } from "react";

const FormField = ({ field, value, onChange, onFileChange, error }) => {
  // Audio/Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  // Video Recording State
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [videoRecordingTime, setVideoRecordingTime] = useState(0);
  const [stream, setStream] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);

  useEffect(() => {
    if (isVideoRecording && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isVideoRecording, stream]);

  const handleChange = (e) => {
    const { value: newValue, files } = e.target;

    if (field.fieldType === "file" || field.fieldType === "video_recording") {
      onFileChange(field.fieldName, files[0]);
    } else if (field.fieldType === "multi_select") {
      const selectedOptions = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      onChange(field.fieldName, selectedOptions);
    } else {
      onChange(field.fieldName, newValue);
    }
  };

  // Audio/Voice Recording Functions
  const startAudioRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);

        const audioFile = new File(
          [audioBlob],
          `${field.fieldName}_recording.webm`,
          {
            type: "audio/webm",
            lastModified: Date.now(),
          }
        );
        onFileChange(field.fieldName, audioFile);

        audioStream.getTracks().forEach((track) => track.stop());
        clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert(
        "Could not access microphone. Please ensure permissions are granted."
      );
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteAudioRecording = () => {
    setRecordedAudio(null);
    setRecordingTime(0);
    onFileChange(field.fieldName, null);
  };

  // Video Recording Functions
  const startVideoRecording = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(videoStream);
      setIsVideoRecording(true);
      setVideoRecordingTime(0);

      const mediaRecorder = new MediaRecorder(videoStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(videoBlob);
        setRecordedVideo(videoUrl);

        const videoFile = new File(
          [videoBlob],
          `${field.fieldName}_recording.webm`,
          {
            type: "video/webm",
            lastModified: Date.now(),
          }
        );
        onFileChange(field.fieldName, videoFile);

        videoStream.getTracks().forEach((track) => track.stop());
        clearInterval(timerRef.current);
        setStream(null);
      };

      mediaRecorder.start();

      timerRef.current = setInterval(() => {
        setVideoRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure permissions are granted.");
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isVideoRecording) {
      mediaRecorderRef.current.stop();
      setIsVideoRecording(false);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const deleteVideoRecording = () => {
    setRecordedVideo(null);
    setVideoRecordingTime(0);
    onFileChange(field.fieldName, null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const baseInputClasses =
    "mt-1 block w-full rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder-gray-400 text-lg px-4 py-4";
  const inputClasses = error
    ? `${baseInputClasses} border-red-400 ring-2 ring-red-200 text-gray-900 bg-white`
    : `${baseInputClasses} border-gray-300 text-gray-900 bg-white`;

  const renderField = () => {
    switch (field.fieldType) {
      case "text":
      case "email":
      case "url":
        return (
          <input
            type={field.fieldType}
            value={value || ""}
            onChange={handleChange}
            placeholder={field.placeholder}
            className={inputClasses}
            required={field.isRequired}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={handleChange}
            placeholder={field.placeholder}
            className={inputClasses}
            required={field.isRequired}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={handleChange}
            placeholder={field.placeholder}
            rows={5}
            className={inputClasses}
            required={field.isRequired}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );

      case "select":
        return (
          <select
            value={value || ""}
            onChange={handleChange}
            className={inputClasses}
            required={field.isRequired}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option.value || option.label}>
                {option.value}
              </option>
            ))}
          </select>
        );

      case "multi_select":
        return (
          <div className="space-y-3">
            <div className="bg-linear-to-br from-purple-50 to-orange-50 border-2 border-purple-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Select multiple options
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {field.options?.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 p-3 hover:bg-white rounded-lg cursor-pointer transition-all border-2 border-transparent hover:border-purple-300 bg-white/50"
                  >
                    <input
                      type="checkbox"
                      value={option.value || option.label}
                      checked={
                        Array.isArray(value) &&
                        value.includes(option.value || option.label)
                      }
                      onChange={(e) => {
                        const currentValues = Array.isArray(value)
                          ? [...value]
                          : [];
                        const optionValue = option.value || option.label;
                        if (e.target.checked) {
                          onChange(field.fieldName, [
                            ...currentValues,
                            optionValue,
                          ]);
                        } else {
                          onChange(
                            field.fieldName,
                            currentValues.filter((v) => v !== optionValue)
                          );
                        }
                      }}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                    />
                    <span className="text-base font-medium text-gray-800">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              {Array.isArray(value) && value.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs font-semibold text-purple-700">
                    Selected: {value.length} option
                    {value.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
            {field.isRequired && (!value || value.length === 0) && (
              <p className="text-xs text-gray-500 flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Please select at least one option
              </p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            <div className="bg-linear-to-br from-purple-50 to-orange-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 p-3 hover:bg-white rounded-lg cursor-pointer transition-all border-2 border-transparent hover:border-purple-300 bg-white/50"
                  >
                    <input
                      type="checkbox"
                      value={option.value || option.label}
                      checked={
                        Array.isArray(value) &&
                        value.includes(option.value || option.label)
                      }
                      onChange={(e) => {
                        const currentValues = Array.isArray(value)
                          ? [...value]
                          : [];
                        const optionValue = option.value || option.label;
                        if (e.target.checked) {
                          onChange(field.fieldName, [
                            ...currentValues,
                            optionValue,
                          ]);
                        } else {
                          onChange(
                            field.fieldName,
                            currentValues.filter((v) => v !== optionValue)
                          );
                        }
                      }}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                    />
                    <span className="text-base font-medium text-gray-800">
                      {option.value}
                    </span>
                  </label>
                ))}
              </div>
              {Array.isArray(value) && value.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs font-semibold text-purple-700">
                    Selected: {value.length} option
                    {value.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
            {field.isRequired && (!value || value.length === 0) && (
              <p className="text-xs text-gray-500 flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Please select at least one option
              </p>
            )}
          </div>
        );

      case "voice_recording":
        return (
          <div className="space-y-4">
            {!recordedAudio ? (
              <div className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all">
                {!isRecording ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-linear-to-br from-purple-700 to-orange-400 p-4 rounded-full">
                        <svg
                          className="w-10 h-10 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={startAudioRecording}
                      className="inline-flex items-center px-8 py-4 bg-linear-to-r from-purple-700 to-orange-400 text-white rounded-full hover:from-purple-800 hover:to-orange-500 transition-all duration-200 shadow-xl font-bold text-lg transform hover:scale-105"
                    >
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Start Voice Recording
                    </button>
                    <p className="text-sm text-gray-600 font-medium">
                      {field.placeholder ||
                        "Click to start recording your voice"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center justify-center space-x-4">
                      <span className="flex h-5 w-5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500"></span>
                      </span>
                      <span className="text-3xl font-mono font-extrabold text-red-600">
                        {formatTime(recordingTime)}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <div className="bg-red-100 px-6 py-2 rounded-full">
                        <p className="text-sm text-red-700 font-bold flex items-center">
                          <span className="animate-pulse mr-2">●</span>
                          Recording in progress...
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={stopAudioRecording}
                      className="inline-flex items-center px-8 py-4 bg-linear-to-r from-gray-800 to-gray-900 text-white rounded-full hover:from-gray-900 hover:to-black transition-all duration-200 shadow-xl font-bold text-lg"
                    >
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <rect x="6" y="6" width="8" height="8" rx="1" />
                      </svg>
                      Stop Recording
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-green-300 bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500 rounded-full p-2">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-base font-bold text-green-900">
                      Recording Complete
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={deleteAudioRecording}
                    className="text-red-600 hover:text-red-800 font-semibold flex items-center bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg transition-all"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
                <audio
                  src={recordedAudio}
                  controls
                  className="w-full rounded-lg shadow-md"
                />
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    Duration: {formatTime(recordingTime)}
                  </span>
                  <span className="text-gray-600 text-xs">audio/webm</span>
                </div>
              </div>
            )}
          </div>
        );

      case "video_recording":
        return (
          <div className="space-y-4">
            {!recordedVideo ? (
              <div className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all">
                {!isVideoRecording ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-linear-to-br from-purple-700 to-orange-400 p-4 rounded-full">
                        <svg
                          className="w-10 h-10 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={startVideoRecording}
                      className="inline-flex items-center px-8 py-4 bg-linear-to-r from-purple-700 to-orange-400 text-white rounded-full hover:from-purple-800 hover:to-orange-500 transition-all duration-200 shadow-xl font-bold text-lg transform hover:scale-105"
                    >
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      Start Video Recording
                    </button>
                    <p className="text-sm text-gray-600 font-medium">
                      {field.placeholder ||
                        "Click to start recording video with your camera"}
                    </p>
                    {field.recordingConfig?.maxDuration && (
                      <p className="text-xs text-gray-500">
                        Max duration:{" "}
                        {Math.floor(field.recordingConfig.maxDuration / 60)}{" "}
                        minutes
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl border-4 border-purple-300"
                    />
                    <div className="flex items-center justify-center space-x-4">
                      <span className="flex h-5 w-5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500"></span>
                      </span>
                      <span className="text-3xl font-mono font-extrabold text-red-600">
                        {formatTime(videoRecordingTime)}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <div className="bg-red-100 px-6 py-2 rounded-full">
                        <p className="text-sm text-red-700 font-bold flex items-center">
                          <span className="animate-pulse mr-2">●</span>
                          Recording video...
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={stopVideoRecording}
                      className="inline-flex items-center px-8 py-4 bg-linear-to-r from-gray-800 to-gray-900 text-white rounded-full hover:from-gray-900 hover:to-black transition-all duration-200 shadow-xl font-bold text-lg"
                    >
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <rect x="6" y="6" width="8" height="8" rx="1" />
                      </svg>
                      Stop Recording
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-purple-300 bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-500 rounded-full p-2">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-base font-bold text-purple-900">
                      Video Recording Complete
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={deleteVideoRecording}
                    className="text-red-600 hover:text-red-800 font-semibold flex items-center bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg transition-all"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
                <video
                  ref={previewVideoRef}
                  src={recordedVideo}
                  controls
                  className="w-full rounded-xl shadow-2xl border-2 border-purple-200"
                />
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    Duration: {formatTime(videoRecordingTime)}
                  </span>
                  <span className="text-gray-600 text-xs">video/webm</span>
                </div>
              </div>
            )}
          </div>
        );

      case "file":
        return (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="file"
                onChange={handleChange}
                accept={field.validation?.allowedFileTypes?.join(",")}
                className="block w-full text-base text-gray-700 bg-white border-2 border-gray-300 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent file:mr-4 file:py-3 file:px-6 file:rounded-l-xl file:border-0 file:text-base file:font-semibold file:bg-linear-to-r file:from-purple-700 file:to-orange-400 file:text-white hover:file:from-purple-800 hover:file:to-orange-500 file:cursor-pointer transition-all"
                required={field.isRequired}
              />
            </div>
            {field.validation?.maxSize && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-700 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Max file size:{" "}
                  {(field.validation.maxSize / (1024 * 1024)).toFixed(0)} MB
                </p>
              </div>
            )}
            {field.validation?.allowedFileTypes && (
              <p className="text-xs text-gray-500">
                Accepted formats: {field.validation.allowedFileTypes.join(", ")}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-800 mb-2">
        {field.fieldLabel}
        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 border border-red-200 rounded-lg p-2">
          <svg
            className="w-4 h-4 mr-1 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      {field.validation?.maxLength && field.fieldType === "textarea" && (
        <div className="mt-2 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {value?.length || 0} / {field.validation.maxLength} characters
          </p>
          {value?.length > field.validation.maxLength * 0.9 && (
            <span className="text-xs text-orange-600 font-semibold">
              Approaching limit
            </span>
          )}
        </div>
      )}
      {field.helpText && (
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-600 flex items-start">
            <svg
              className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {field.helpText}
          </p>
        </div>
      )}
    </div>
  );
};

export default FormField;
