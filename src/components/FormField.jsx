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
            className="w-full"
            required={field.isRequired}
            style={{
              fontFamily: '"Poppins", "Inter", sans-serif',
              fontSize: '1.07rem',
              color: '#333333',
              fontWeight: 500,
              border: 'none',
              borderBottom: error ? '2px solid #A67390' : '2px solid #E5D2C7',
              background: '#fff',
              outline: 'none',
              padding: '13px 0 7px 0',
              transition: 'border-bottom 0.2s ease'
            }}
            onFocus={(e) => (e.target.style.borderBottom = '2px solid #592D4A')}
            onBlur={(e) => (e.target.style.borderBottom = error ? '2px solid #A67390' : '2px solid #E5D2C7')}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={handleChange}
            placeholder={field.placeholder}
            className="w-full"
            required={field.isRequired}
            min={field.validation?.min}
            max={field.validation?.max}
            style={{
              fontFamily: '"Poppins", "Inter", sans-serif',
              fontSize: '1.07rem',
              color: '#333333',
              fontWeight: 500,
              border: 'none',
              borderBottom: error ? '2px solid #A67390' : '2px solid #E5D2C7',
              background: '#fff',
              outline: 'none',
              padding: '13px 0 7px 0',
              transition: 'border-bottom 0.2s ease'
            }}
            onFocus={(e) => (e.target.style.borderBottom = '2px solid #592D4A')}
            onBlur={(e) => (e.target.style.borderBottom = error ? '2px solid #A67390' : '2px solid #E5D2C7')}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={handleChange}
            placeholder={field.placeholder}
            rows={5}
            className="w-full"
            required={field.isRequired}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            style={{
              fontFamily: '"Poppins", "Inter", sans-serif',
              fontSize: '1.07rem',
              color: '#333333',
              fontWeight: 400,
              border: 'none',
              borderBottom: error ? '2px solid #A67390' : '2px solid #E5D2C7',
              background: '#fff',
              outline: 'none',
              padding: '13px 0 7px 0',
              transition: 'border-bottom 0.2s ease',
              resize: 'vertical'
            }}
            onFocus={(e) => (e.target.style.borderBottom = '2px solid #592D4A')}
            onBlur={(e) => (e.target.style.borderBottom = error ? '2px solid #A67390' : '2px solid #E5D2C7')}
          />
        );

      case "select":
        return (
          <select
            value={value || ""}
            onChange={handleChange}
            className="w-full"
            required={field.isRequired}
            style={{
              fontFamily: '"Poppins", "Inter", sans-serif',
              fontSize: '1.07rem',
              color: '#333333',
              fontWeight: 500,
              border: 'none',
              borderBottom: error ? '2px solid #A67390' : '2px solid #E5D2C7',
              background: '#fff',
              outline: 'none',
              padding: '13px 0 7px 0'
            }}
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
            <div style={{
              background: 'linear-gradient(135deg, #F9F3F6 0%, #FFFFFF 100%)', // Lighter gradient
              border: '2px solid #A67390', // Elegant Mauve border
              borderRadius: 16,
              padding: 18
            }}>
              <p style={{
                fontFamily: '"Playfair Display", "Lora", serif',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#592D4A',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center'
              }}>
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
                    className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: '#fff',
                      border: '2px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = '2px solid #A67390';
                      e.currentTarget.style.background = '#FBF9F6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '2px solid transparent';
                      e.currentTarget.style.background = '#fff';
                    }}
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
                      className="w-5 h-5 cursor-pointer"
                      style={{
                        accentColor: '#592D4A'
                      }}
                    />
                    <span style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: '#333333'
                    }}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              {Array.isArray(value) && value.length > 0 && (
                <div style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid #B7966B'
                }}>
                  <p style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#592D4A'
                  }}>
                    Selected: {value.length} option
                    {value.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
            {field.isRequired && (!value || value.length === 0) && (
              <p style={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.85rem',
                color: '#A67390',
                display: 'flex',
                alignItems: 'center'
              }}>
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
            <div style={{
              background: 'linear-gradient(135deg, #F9F3F6 0%, #FFFFFF 100%)', // Lighter gradient
              border: '2px solid #A67390', // Elegant Mauve border
              borderRadius: 16,
              padding: 18
            }}>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: '#fff',
                      border: '2px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = '2px solid #A67390';
                      e.currentTarget.style.background = '#FBF9F6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '2px solid transparent';
                      e.currentTarget.style.background = '#fff';
                    }}
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
                      className="w-5 h-5 cursor-pointer"
                      style={{
                        accentColor: '#592D4A'
                      }}
                    />
                    <span style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: '#333333'
                    }}>
                      {option.value}
                    </span>
                  </label>
                ))}
              </div>
              {Array.isArray(value) && value.length > 0 && (
                <div style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid #B7966B'
                }}>
                  <p style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#592D4A'
                  }}>
                    Selected: {value.length} option
                    {value.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
            {field.isRequired && (!value || value.length === 0) && (
              <p style={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.85rem',
                color: '#A67390',
                display: 'flex',
                alignItems: 'center'
              }}>
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
              <div style={{
                border: '3px dashed #B7966B',
                borderRadius: 20,
                padding: 32,
                textAlign: 'center',
                background: '#FBF9F6',
                transition: 'all 0.3s ease'
              }}>
                {!isRecording ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div style={{
                        background: 'linear-gradient(135deg, #592D4A 0%, #A67390 100%)',
                        padding: 16,
                        borderRadius: '50%'
                      }}>
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
                      className="inline-flex items-center px-8 py-4 rounded-full transform transition-all duration-300"
                      style={{
                        background: '#592D4A',
                        color: '#FBF9F6',
                        fontFamily: '"Lora", serif',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        boxShadow: '0 6px 20px rgba(89, 45, 74, 0.15)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#432235';
                        e.currentTarget.style.boxShadow = '0 8px 28px rgba(89, 45, 74, 0.25)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#592D4A';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(89, 45, 74, 0.15)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
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
                    <p style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.95rem',
                      color: '#333333',
                      fontWeight: 500
                    }}>
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
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: '#dc2626'
                      }}>
                        {formatTime(recordingTime)}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <div style={{
                        background: '#fee2e2',
                        padding: '8px 24px',
                        borderRadius: 999
                      }}>
                        <p style={{
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '0.9rem',
                          color: '#991b1b',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <span className="animate-pulse mr-2">●</span>
                          Recording in progress...
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={stopAudioRecording}
                      className="inline-flex items-center px-8 py-4 rounded-full transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                        color: '#fff',
                        fontFamily: '"Lora", serif',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
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
              <div style={{
                border: '2px solid #86efac',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.1)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div style={{
                      background: '#22c55e',
                      borderRadius: '50%',
                      padding: 8
                    }}>
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
                    <span style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#14532d'
                    }}>
                      Recording Complete
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={deleteAudioRecording}
                    className="flex items-center px-4 py-2 rounded-lg transition-all"
                    style={{
                      color: '#dc2626',
                      background: '#fee2e2',
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fecaca';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fee2e2';
                    }}
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
                  <span style={{
                    fontFamily: '"Poppins", sans-serif',
                    color: '#333333',
                    fontWeight: 500
                  }}>
                    Duration: {formatTime(recordingTime)}
                  </span>
                  <span style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.8rem',
                    color: '#666'
                  }}>
                    audio/webm
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case "video_recording":
        return (
          <div className="space-y-4">
            {!recordedVideo ? (
              <div style={{
                border: '3px dashed #B7966B',
                borderRadius: 20,
                padding: 32,
                textAlign: 'center',
                background: '#FBF9F6',
                transition: 'all 0.3s ease'
              }}>
                {!isVideoRecording ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div style={{
                        background: 'linear-gradient(135deg, #592D4A 0%, #A67390 100%)',
                        padding: 16,
                        borderRadius: '50%'
                      }}>
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
                      className="inline-flex items-center px-8 py-4 rounded-full transform transition-all duration-300"
                      style={{
                        background: '#592D4A',
                        color: '#FBF9F6',
                        fontFamily: '"Lora", serif',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        boxShadow: '0 6px 20px rgba(89, 45, 74, 0.15)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#432235';
                        e.currentTarget.style.boxShadow = '0 8px 28px rgba(89, 45, 74, 0.25)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#592D4A';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(89, 45, 74, 0.15)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
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
                    <p style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.95rem',
                      color: '#333333',
                      fontWeight: 500
                    }}>
                      {field.placeholder ||
                        "Click to start recording video with your camera"}
                    </p>
                    {field.recordingConfig?.maxDuration && (
                      <p style={{
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: '0.8rem',
                        color: '#666'
                      }}>
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
                      className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl"
                      style={{
                        border: '4px solid #A67390'
                      }}
                    />
                    <div className="flex items-center justify-center space-x-4">
                      <span className="flex h-5 w-5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500"></span>
                      </span>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: '#dc2626'
                      }}>
                        {formatTime(videoRecordingTime)}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <div style={{
                        background: '#fee2e2',
                        padding: '8px 24px',
                        borderRadius: 999
                      }}>
                        <p style={{
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '0.9rem',
                          color: '#991b1b',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <span className="animate-pulse mr-2">●</span>
                          Recording video...
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={stopVideoRecording}
                      className="inline-flex items-center px-8 py-4 rounded-full transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                        color: '#fff',
                        fontFamily: '"Lora", serif',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
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
              <div style={{
                border: '2px solid #c4b5fd',
                background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.1)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div style={{
                      background: '#A67390',
                      borderRadius: '50%',
                      padding: 8
                    }}>
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
                    <span style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#592D4A'
                    }}>
                      Video Recording Complete
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={deleteVideoRecording}
                    className="flex items-center px-4 py-2 rounded-lg transition-all"
                    style={{
                      color: '#dc2626',
                      background: '#fee2e2',
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fecaca';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fee2e2';
                    }}
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
                  className="w-full rounded-xl shadow-2xl"
                  style={{
                    border: '2px solid #c4b5fd'
                  }}
                />
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span style={{
                    fontFamily: '"Poppins", sans-serif',
                    color: '#333333',
                    fontWeight: 500
                  }}>
                    Duration: {formatTime(videoRecordingTime)}
                  </span>
                  <span style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.8rem',
                    color: '#666'
                  }}>
                    video/webm
                  </span>
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
                className="block w-full text-base cursor-pointer focus:outline-none transition-all"
                required={field.isRequired}
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  color: '#333333',
                  background: '#fff',
                  border: '2px solid #E5D2C7',
                  borderRadius: 16,
                  padding: 0
                }}
              />
              <style jsx>{`
                input[type="file"]::file-selector-button {
                  margin-right: 16px;
                  padding: 12px 24px;
                  border-radius: 16px 0 0 16px;
                  border: 0;
                  font-size: 1rem;
                  font-weight: 600;
                  font-family: "Lora", serif;
                  background: #592D4A;
                  color: #FBF9F6;
                  cursor: pointer;
                  transition: all 0.3s ease;
                }
                input[type="file"]::file-selector-button:hover {
                  background: #432235;
                }
              `}</style>
            </div>
            {field.validation?.maxSize && (
              <div style={{
                background: '#F0E6ED',
                border: '1px solid #B7966B',
                borderRadius: 10,
                padding: 12
              }}>
                <p style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.85rem',
                  color: '#592D4A',
                  display: 'flex',
                  alignItems: 'center'
                }}>
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
              <p style={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.8rem',
                color: '#666'
              }}>
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
    <div
      className="mb-8"
      style={{
        background: '#FFFFFF', // Clean White interior
        borderRadius: 18,
        boxShadow: '0 2px 18px rgba(89,45,74,0.08)',
        padding: '26px 22px',
        border: '1px solid #E5D2C7' // Subtle accent border
      }}
    >
      <label
        className="block mb-3"
        style={{
          color: '#333333',
          fontFamily: '"Playfair Display", "Lora", serif',
          fontWeight: 600,
          fontSize: '1.13rem',
          letterSpacing: '0.01em'
        }}
      >
        {field.fieldLabel}
        {field.isRequired && <span style={{ color: '#A67390', marginLeft: 5 }}>*</span>}
      </label>
      {renderField()}
      {error && (
        <div style={{
          color: '#A67390',
          background: '#FBF9F6',
          border: '1.5px solid #A67390',
          borderRadius: 7,
          fontFamily: '"Poppins", sans-serif',
          padding: '7px 12px',
          fontSize: '0.96rem',
          marginTop: 8,
          display: 'flex',
          alignItems: 'center'
        }}>
          <svg
            className="w-4 h-4 mr-2 shrink-0"
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
        </div>
      )}
      {field.validation?.maxLength && field.fieldType === "textarea" && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8
        }}>
          <span style={{
            fontFamily: '"Poppins", sans-serif',
            color: '#592D4A',
            fontWeight: 500,
            fontSize: '0.95rem'
          }}>
            {value?.length || 0} / {field.validation.maxLength} characters
          </span>
          {value?.length > field.validation.maxLength * 0.9 && (
            <span style={{
              color: '#A67390',
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              fontSize: '0.86rem'
            }}>
              Approaching limit
            </span>
          )}
        </div>
      )}
      {field.helpText && (
        <div style={{
          background: '#F0F0F0',
          border: '1px solid #E5D2C7',
          borderRadius: 8,
          fontFamily: '"Poppins", sans-serif',
          padding: '11px 14px',
          fontSize: '0.95rem',
          color: '#333333',
          marginTop: 8,
          display: 'flex',
          alignItems: 'start'
        }}>
          <svg
            className="w-4 h-4 mr-2 mt-0.5 shrink-0"
            style={{ color: '#999' }}
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
        </div>
      )}
    </div>
  );
};

export default FormField;
