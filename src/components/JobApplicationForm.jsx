import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormField from "./FormField";
import SuccessScreen from "./SuccessScreen";
import {
  submitApplication,
  selectApplicationLoading,
  selectApplicationError,
  selectSubmitStatus,
  resetSubmitStatus,
  selectCurrentApplication,
} from "../redux/applicationSlice";
import {
  uploadDocument,
  uploadVoiceRecording,
  uploadVideoRecording,
} from "../redux/jobSlice";

const JobApplicationForm = ({ jobData }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState({});
  const [fileFieldTypes, setFileFieldTypes] = useState({});
  const [uploadedFileUrls, setUploadedFileUrls] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const loading = useSelector(selectApplicationLoading);
  const error = useSelector(selectApplicationError);
  const submitStatus = useSelector(selectSubmitStatus);
  const submittedApplication = useSelector(selectCurrentApplication);

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const handleFileChange = (fieldName, file, fieldType) => {
    setFiles((prev) => ({ ...prev, [fieldName]: file }));
    setFileFieldTypes((prev) => ({ ...prev, [fieldName]: fieldType }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const validateField = (field, value) => {
    const fileBasedTypes = ["file", "voice_recording", "video_recording"];

    if (field.isRequired) {
      if (fileBasedTypes.includes(field.fieldType)) {
        if (!files[field.fieldName]) {
          return `${field.fieldLabel} is required`;
        }
      } else if (
        !value ||
        (typeof value === "string" && value.trim().length === 0) ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return `${field.fieldLabel} is required`;
      }
    }

    if (!value && !field.isRequired) {
      return null;
    }

    if (field.validation) {
      const { min, max, minLength, maxLength } = field.validation;

      if (field.fieldType === "number") {
        const numValue = Number(value);
        if (min !== undefined && numValue < min) {
          return `Minimum value is ${min}`;
        }
        if (max !== undefined && numValue > max) {
          return `Maximum value is ${max}`;
        }
      }

      if (field.fieldType === "textarea" || field.fieldType === "text") {
        if (value && typeof value === "string") {
          if (minLength && value.length < minLength) {
            return `Minimum length is ${minLength} characters`;
          }
          if (maxLength && value.length > maxLength) {
            return `Maximum length is ${maxLength} characters`;
          }
        }
      }
    }

    if (field.fieldType === "url" && value) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(value)) {
        return "Please enter a valid URL";
      }
    }

    if (field.fieldType === "email" && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return "Please enter a valid email";
      }
    }

    return null;
  };

  const uploadFiles = async () => {
    const fileUploads = {};

    for (const [fieldName, file] of Object.entries(files)) {
      if (file) {
        try {
          const fieldType = fileFieldTypes[fieldName];
          let result;

          switch (fieldType) {
            case "voice_recording":
              result = await dispatch(
                uploadVoiceRecording({ file, maxDuration: 300 })
              ).unwrap();
              fileUploads[fieldName] = result.data;
              break;

            case "video_recording":
              result = await dispatch(
                uploadVideoRecording({ file, quality: "auto:low" })
              ).unwrap();
              fileUploads[fieldName] = result.data;
              break;

            case "file":
            default:
              result = await dispatch(uploadDocument(file)).unwrap();
              const uploadedUrl = Array.isArray(result.data)
                ? result.data[0]
                : result.data;

              if (typeof uploadedUrl === "string") {
                fileUploads[fieldName] = {
                  url: uploadedUrl,
                  filename: file.name,
                  size: file.size,
                  mimeType: file.type,
                  uploadedAt: new Date().toISOString(),
                };
              } else {
                fileUploads[fieldName] = uploadedUrl;
              }
              break;
          }

          console.log(`Uploaded ${fieldName}:`, fileUploads[fieldName]);
        } catch (err) {
          console.error(`Upload error for ${fieldName}:`, err);
          throw new Error(
            `Failed to upload ${fieldName}: ${err.message || "Upload failed"}`
          );
        }
      }
    }

    return fileUploads;
  };

  const getSectionMediaType = (section) => {
    const title = section.sectionTitle.toLowerCase();
    const description = section.sectionDescription?.toLowerCase() || "";

    if (
      title.includes("voice") ||
      title.includes("audio") ||
      (title.includes("recording") && !title.includes("video"))
    ) {
      return "voice_recording";
    }

    if (title.includes("video")) {
      return "video_recording";
    }

    if (
      description.includes("voice") ||
      description.includes("audio") ||
      description.includes("record yourself")
    ) {
      return "voice_recording";
    }

    if (description.includes("video")) {
      return "video_recording";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Name is required";
    }
    if (!formData.email || formData.email.trim().length === 0) {
      newErrors.email = "Email is required";
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
    }
    if (!formData.phone || formData.phone.trim().length === 0) {
      newErrors.phone = "Phone is required";
    }

    jobData.customSections?.forEach((section) => {
      if (section.fields && section.fields.length > 0) {
        section.fields.forEach((field) => {
          const fileBasedTypes = ["file", "voice_recording", "video_recording"];
          let value;

          if (fileBasedTypes.includes(field.fieldType)) {
            value = files[field.fieldName];
          } else {
            value = formData[field.fieldName];
          }

          const error = validateField(field, value);
          if (error) {
            newErrors[field.fieldName] = error;
          }
        });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setIsUploading(true);
      const uploadedFiles = await uploadFiles();
      setIsUploading(false);

      const responses = [];

      jobData.customSections?.forEach((section) => {
        const mediaType = getSectionMediaType(section);

        if (section.fields && section.fields.length > 0) {
          section.fields.forEach((field) => {
            const fileBasedTypes = [
              "file",
              "voice_recording",
              "video_recording",
            ];
            const responseObj = {
              fieldName: field.fieldName,
              fieldLabel: field.fieldLabel,
              fieldType: field.fieldType,
              value: null,
              files: [],
            };

            if (fileBasedTypes.includes(field.fieldType)) {
              const uploadedFile = uploadedFiles[field.fieldName];
              if (uploadedFile) {
                responseObj.files.push({
                  url: uploadedFile.url,
                  filename: uploadedFile.filename,
                  size: uploadedFile.size,
                  mimeType: uploadedFile.mimeType,
                  uploadedAt:
                    uploadedFile.uploadedAt || new Date().toISOString(),
                });
              }
            } else {
              responseObj.value = formData[field.fieldName] || null;
            }

            responses.push(responseObj);
          });
        } else if (mediaType) {
          const sectionFieldName = section.sectionTitle;
          const uploadedFile = uploadedFiles[sectionFieldName];

          if (uploadedFile) {
            responses.push({
              fieldName: sectionFieldName,
              fieldLabel: section.sectionTitle,
              fieldType: mediaType,
              value: null,
              files: [
                {
                  url: uploadedFile.url,
                  filename: uploadedFile.filename,
                  size: uploadedFile.size,
                  mimeType: uploadedFile.mimeType,
                  uploadedAt:
                    uploadedFile.uploadedAt || new Date().toISOString(),
                },
              ],
            });
          }
        }
      });

      const applicationData = {
        jobListingId: jobData._id,
        candidate: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
        responses: responses,
        formSnapshot: {
          customSections: jobData.customSections,
        },
      };

      console.log("Submitting application:", applicationData);
      await dispatch(submitApplication(applicationData)).unwrap();
    } catch (err) {
      console.error("Submission error:", err);
      setIsUploading(false);
      setErrors({
        submit:
          err.message || "Failed to submit application. Please try again.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes("pdf")) {
      return (
        <svg
          className="w-6 h-6"
          style={{ color: '#A67390' }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (mimeType?.includes("image")) {
      return (
        <svg
          className="w-6 h-6"
          style={{ color: '#592D4A' }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (mimeType?.includes("video")) {
      return (
        <svg
          className="w-6 h-6"
          style={{ color: '#B7966B' }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      );
    }
    return (
      <svg
        className="w-6 h-6"
        style={{ color: '#666' }}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  const renderMediaFiles = () => {
    if (!jobData.media || jobData.media.length === 0) return null;

    const sortedMedia = jobData.media
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
      <div style={{
        background: 'linear-gradient(135deg, #F0E6ED 0%, #FBF9F6 100%)',
        borderRadius: 20,
        boxShadow: '0 4px 20px rgba(89, 45, 74, 0.1)',
        border: '1.5px solid #B7966B',
        padding: 32,
        marginBottom: 32
      }}>
        <h3 style={{
          fontFamily: '"Playfair Display", "Lora", serif',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#592D4A',
          marginBottom: 12,
          borderBottom: '2px solid #B7966B',
          paddingBottom: 12
        }}>
          📎 Attachments & Resources
        </h3>
        <p style={{
          fontFamily: '"Poppins", sans-serif',
          color: '#666',
          marginBottom: 24
        }}>
          Review the following materials related to this position
        </p>

        <div className="space-y-4">
          {sortedMedia.map((media, index) => (
            <div
              key={media._id || index}
              className="transition-all duration-200"
              style={{
                background: '#fff',
                border: '2px solid #E5D2C7',
                borderRadius: 16,
                padding: 20
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '2px solid #A67390';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(89, 45, 74, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '2px solid #E5D2C7';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                <div className="flex items-center space-x-4 w-full sm:flex-1">
                  <div className="shrink-0">{getFileIcon(media.mimeType)}</div>

                  <div className="flex-1 min-w-0">
                    <p 
                      className="tooltip"
                      data-tooltip={media.filename || "Document"}
                      style={{
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#333',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {media.filename || "Document"}
                    </p>
                    {media.caption && (
                      <p 
                        className="tooltip"
                        data-tooltip={media.caption}
                        style={{
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '0.9rem',
                          color: '#666',
                          marginTop: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {media.caption}
                      </p>
                    )}
                    <div className="flex items-center space-x-3 mt-2" style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.8rem',
                      color: '#999'
                    }}>
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        {media.type || "Document"}
                      </span>
                      {media.size && (
                        <span>{(media.size / 1024).toFixed(2)} KB</span>
                      )}
                    </div>
                  </div>
                </div>

                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto ml-0 sm:ml-4 shrink-0 flex items-center justify-center sm:justify-start space-x-2 transition-all duration-200"
                  style={{
                    background: '#592D4A',
                    color: '#FBF9F6',
                    padding: '10px 20px',
                    borderRadius: 10,
                    fontFamily: '"Lora", serif',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(89, 45, 74, 0.15)',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#432235';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(89, 45, 74, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#592D4A';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(89, 45, 74, 0.15)';
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomSections = () => {
    if (!jobData.customSections) return null;

    const sortedSections = jobData.customSections
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return sortedSections.map((section, sectionIndex) => {
      const mediaType = getSectionMediaType(section);

      if ((!section.fields || section.fields.length === 0) && mediaType) {
        const syntheticField = {
          fieldName: section.sectionTitle,
          fieldLabel: section.sectionTitle,
          fieldType: mediaType,
          isRequired: false,
          placeholder:
            section.sectionDescription ||
            `Record your ${mediaType.replace("_", " ")}`,
        };

        return (
          <div
            key={section._id || sectionIndex}
            className="transform transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #F0E6ED 0%, #FBF9F6 100%)',
              borderRadius: 20,
              boxShadow: '0 4px 20px rgba(89, 45, 74, 0.1)',
              border: '1.5px solid #B7966B',
              padding: 32,
              marginBottom: 32
            }}
          >
            <h3 style={{
              fontFamily: '"Playfair Display", "Lora", serif',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#592D4A',
              marginBottom: 12
            }}>
              {section.sectionTitle}
            </h3>
            {section.sectionDescription && (
              <p style={{
                fontFamily: '"Poppins", sans-serif',
                color: '#666',
                marginBottom: 24,
                lineHeight: 1.6
              }}>
                {section.sectionDescription}
              </p>
            )}
            <div className="space-y-6">
              <FormField
                field={syntheticField}
                value={formData[syntheticField.fieldName] || ""}
                onChange={handleFieldChange}
                onFileChange={(fieldName, file) =>
                  handleFileChange(fieldName, file, mediaType)
                }
                error={errors[syntheticField.fieldName]}
              />
            </div>
          </div>
        );
      }

      if ((!section.fields || section.fields.length === 0) && !mediaType) {
        return (
          <div
            key={section._id || sectionIndex}
            className="transform transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #F0E6ED 0%, #FBF9F6 100%)',
              borderRadius: 20,
              boxShadow: '0 4px 20px rgba(89, 45, 74, 0.1)',
              border: '1.5px solid #B7966B',
              padding: 32,
              marginBottom: 32
            }}
          >
            <h3 style={{
              fontFamily: '"Playfair Display", "Lora", serif',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#592D4A',
              marginBottom: 12
            }}>
              {section.sectionTitle}
            </h3>
            {section.sectionDescription && (
              <p style={{
                fontFamily: '"Poppins", sans-serif',
                color: '#666',
                lineHeight: 1.6
              }}>
                {section.sectionDescription}
              </p>
            )}
          </div>
        );
      }

      return (
        <div
          key={section._id || sectionIndex}
          className="transform transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #F0E6ED 0%, #FBF9F6 100%)',
            borderRadius: 20,
            boxShadow: '0 4px 20px rgba(89, 45, 74, 0.1)',
            border: '1.5px solid #B7966B',
            padding: 32,
            marginBottom: 32
          }}
        >
          <h3 style={{
            fontFamily: '"Playfair Display", "Lora", serif',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#592D4A',
            marginBottom: 12
          }}>
            {section.sectionTitle}
          </h3>
          {section.sectionDescription && (
            <p style={{
              fontFamily: '"Poppins", sans-serif',
              color: '#666',
              marginBottom: 24,
              lineHeight: 1.6
            }}>
              {section.sectionDescription}
            </p>
          )}
          <div className="space-y-6">
            {section.fields
              .slice()
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((field, fieldIndex) => (
                <FormField
                  key={field._id || field.fieldName || fieldIndex}
                  field={field}
                  value={formData[field.fieldName] || ""}
                  onChange={handleFieldChange}
                  onFileChange={(fieldName, file) =>
                    handleFileChange(fieldName, file, field.fieldType)
                  }
                  error={errors[field.fieldName]}
                />
              ))}
          </div>
        </div>
      );
    });
  };

  const shouldDisplayExperience = () => {
    if (!jobData.experienceRequired) return false;
    const { min, max } = jobData.experienceRequired;
    return min > 0 || max > 0;
  };

  const shouldDisplaySalary = () => {
    if (!jobData.salary) return false;
    const { min, max } = jobData.salary;
    return min > 0 || max > 0;
  };

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: '#FBF9F6' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Lora:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
          
          .tooltip {
            position: relative;
            cursor: help;
          }
          
          .tooltip::before {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            background: #592D4A;
            color: #FBF9F6;
            padding: 8px 12px;
            border-radius: 8px;
            font-family: 'Poppins', sans-serif;
            font-size: 0.85rem;
            font-weight: 500;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(89, 45, 74, 0.25);
            max-width: 250px;
            text-align: center;
          }
          
          .tooltip::after {
            content: '';
            position: absolute;
            bottom: 120%;
            left: 50%;
            transform: translateX(-50%);
            border: 5px solid transparent;
            border-top-color: #592D4A;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
          }
          
          .tooltip:hover::before,
          .tooltip:hover::after {
            opacity: 1;
            visibility: visible;
          }
          
          .tooltip[data-tooltip]:hover::before {
            white-space: normal;
            max-width: 250px;
          }
        `}
      </style>
      <div className="max-w-5xl mx-auto">
        {/* Job Header */}
        <div style={{
          background: 'linear-gradient(135deg, #F0E6ED 0%, #FBF9F6 100%)',
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(89, 45, 74, 0.12)',
          border: '1.5px solid #B7966B', // Gold/Dust Accent Border
          padding: 40,
          marginBottom: 40
        }}>
          <div style={{
            borderLeft: '4px solid #592D4A',
            paddingLeft: 24
          }}>
            <h1 style={{
              fontFamily: '"Playfair Display", "Lora", serif',
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#592D4A',
              marginBottom: 16,
              lineHeight: 1.2
            }}>
              {jobData.jobTitle}
            </h1>
            <p style={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: '1.1rem',
              color: '#333',
              marginBottom: 24,
              lineHeight: 1.6
            }}>
              {jobData.jobDescription}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {jobData.role && (
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: 20,
                boxShadow: '0 2px 8px rgba(89, 45, 74, 0.06)',
                border: '1px solid #E5D2C7'
              }}>
                <span style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#592D4A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Role Level
                </span>
                <p style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '1rem',
                  color: '#333',
                  marginTop: 8,
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}>
                  {jobData.role}
                </p>
              </div>
            )}

            {jobData.employmentType && (
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: 20,
                boxShadow: '0 2px 8px rgba(89, 45, 74, 0.06)',
                border: '1px solid #E5D2C7'
              }}>
                <span style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#592D4A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Employment Type
                </span>
                <p style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '1rem',
                  color: '#333',
                  marginTop: 8,
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}>
                  {jobData.employmentType.replace("_", " ")}
                </p>
              </div>
            )}

            {jobData.qualifications && jobData.qualifications.length > 0 && (
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: 20,
                boxShadow: '0 2px 8px rgba(89, 45, 74, 0.06)',
                border: '1px solid #E5D2C7'
              }}>
                <span style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#592D4A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 12,
                  display: 'block'
                }}>
                  Required Qualifications
                </span>
                <div className="flex flex-wrap gap-2">
                  {jobData.qualifications.map((qual, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '4px 12px',
                        background: '#F0E6ED',
                        color: '#592D4A',
                        borderRadius: 999,
                        fontSize: '0.9rem',
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 500
                      }}
                    >
                      {qual}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {jobData.tags && jobData.tags.length > 0 && (
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: 20,
                boxShadow: '0 2px 8px rgba(89, 45, 74, 0.06)',
                border: '1px solid #E5D2C7'
              }}>
                <span style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#592D4A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 12,
                  display: 'block'
                }}>
                  Required Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {jobData.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '4px 12px',
                        background: '#FFF4E6',
                        color: '#B7966B',
                        borderRadius: 999,
                        fontSize: '0.9rem',
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 500
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {jobData.expiresAt && (
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: 20,
                boxShadow: '0 2px 8px rgba(89, 45, 74, 0.06)',
                border: '1px solid #E5D2C7'
              }}>
                <span style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#A67390',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Application Deadline
                </span>
                <p style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '1rem',
                  color: '#333',
                  marginTop: 8,
                  fontWeight: 500
                }}>
                  {new Date(jobData.expiresAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>

          {(shouldDisplayExperience() ||
            jobData.location ||
            shouldDisplaySalary()) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {shouldDisplayExperience() && (
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: '0 2px 8px rgba(89, 45, 74, 0.06)',
                  border: '1px solid #E5D2C7'
                }}>
                  <span style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#592D4A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Experience Required
                  </span>
                  <p style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '1rem',
                    color: '#333',
                    marginTop: 8,
                    fontWeight: 500
                  }}>
                    {jobData.experienceRequired.min} -{" "}
                    {jobData.experienceRequired.max}{" "}
                    {jobData.experienceRequired.unit}
                  </p>
                </div>
              )}

              {jobData.location && (
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: '0 2px 8px rgba(89, 45, 74, 0.06)',
                  border: '1px solid #E5D2C7'
                }}>
                  <span style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#592D4A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Location
                  </span>
                  <p style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '1rem',
                    color: '#333',
                    marginTop: 8,
                    fontWeight: 500
                  }}>
                    {jobData.location.city}, {jobData.location.state},{" "}
                    {jobData.location.country}
                    {jobData.location.isRemote && (
                      <span style={{ marginLeft: 8, color: '#22c55e' }}>🌐 Remote</span>
                    )}
                  </p>
                </div>
              )}

              {shouldDisplaySalary() && (
                <div className="md:col-span-2" style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: '0 2px 8px rgba(89, 45, 74, 0.06)',
                  border: '1px solid #E5D2C7'
                }}>
                  <span style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#592D4A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Salary Range
                  </span>
                  <p style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '1rem',
                    color: '#333',
                    marginTop: 8,
                    fontWeight: 500
                  }}>
                    {jobData.salary.currency}{" "}
                    {jobData.salary.min.toLocaleString()} -{" "}
                    {jobData.salary.max.toLocaleString()} /{" "}
                    {jobData.salary.period}
                    {jobData.salary.isNegotiable && (
                      <span style={{ marginLeft: 8, color: '#22c55e' }}>(Negotiable)</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {renderMediaFiles()}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div style={{
            background: 'linear-gradient(135deg, #F0E6ED 0%, #FBF9F6 100%)',
            borderRadius: 20,
            boxShadow: '0 4px 20px rgba(89, 45, 74, 0.1)',
            border: '1.5px solid #B7966B', // Gold/Dust Accent Border
            padding: 32
          }}>
            <h3 style={{
              fontFamily: '"Playfair Display", "Lora", serif',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#592D4A',
              marginBottom: 24,
              borderBottom: '2px solid #B7966B',
              paddingBottom: 12
            }}>
              Candidate Information
            </h3>
            <div className="space-y-6">
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: '"Playfair Display", "Lora", serif',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: 8
                }}>
                  Full Name <span style={{ color: '#A67390' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="w-full"
                  placeholder="Enter your full name"
                  style={{
                    fontFamily: '"Poppins", "Inter", sans-serif',
                    fontSize: '1.07rem',
                    color: '#333',
                    fontWeight: 500,
                    border: 'none',
                    borderBottom: errors.name ? '2px solid #A67390' : '2px solid #E5D2C7',
                    background: '#fff',
                    outline: 'none',
                    padding: '13px 0 7px 0',
                    transition: 'border-bottom 0.2s ease'
                  }}
                  onFocus={(e) => (e.target.style.borderBottom = '2px solid #592D4A')}
                  onBlur={(e) => (e.target.style.borderBottom = errors.name ? '2px solid #A67390' : '2px solid #E5D2C7')}
                />
                {errors.name && (
                  <p style={{
                    marginTop: 8,
                    fontSize: '0.9rem',
                    color: '#A67390',
                    fontFamily: '"Poppins", sans-serif',
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
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontFamily: '"Playfair Display", "Lora", serif',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: 8
                }}>
                  Email Address <span style={{ color: '#A67390' }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className="w-full"
                  placeholder="your.email@example.com"
                  style={{
                    fontFamily: '"Poppins", "Inter", sans-serif',
                    fontSize: '1.07rem',
                    color: '#333',
                    fontWeight: 500,
                    border: 'none',
                    borderBottom: errors.email ? '2px solid #A67390' : '2px solid #E5D2C7',
                    background: '#fff',
                    outline: 'none',
                    padding: '13px 0 7px 0',
                    transition: 'border-bottom 0.2s ease'
                  }}
                  onFocus={(e) => (e.target.style.borderBottom = '2px solid #592D4A')}
                  onBlur={(e) => (e.target.style.borderBottom = errors.email ? '2px solid #A67390' : '2px solid #E5D2C7')}
                />
                {errors.email && (
                  <p style={{
                    marginTop: 8,
                    fontSize: '0.9rem',
                    color: '#A67390',
                    fontFamily: '"Poppins", sans-serif',
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
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontFamily: '"Playfair Display", "Lora", serif',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: 8
                }}>
                  Phone Number <span style={{ color: '#A67390' }}>*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  className="w-full"
                  placeholder="+91 98765 43210"
                  style={{
                    fontFamily: '"Poppins", "Inter", sans-serif',
                    fontSize: '1.07rem',
                    color: '#333',
                    fontWeight: 500,
                    border: 'none',
                    borderBottom: errors.phone ? '2px solid #A67390' : '2px solid #E5D2C7',
                    background: '#fff',
                    outline: 'none',
                    padding: '13px 0 7px 0',
                    transition: 'border-bottom 0.2s ease'
                  }}
                  onFocus={(e) => (e.target.style.borderBottom = '2px solid #592D4A')}
                  onBlur={(e) => (e.target.style.borderBottom = errors.phone ? '2px solid #A67390' : '2px solid #E5D2C7')}
                />
                {errors.phone && (
                  <p style={{
                    marginTop: 8,
                    fontSize: '0.9rem',
                    color: '#A67390',
                    fontFamily: '"Poppins", sans-serif',
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
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {renderCustomSections()}

          {(error || errors.submit) && (
            <div style={{
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              border: '2px solid #f87171',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
            }}>
              <div className="flex items-start">
                <div className="shrink-0">
                  <svg
                    className="w-6 h-6"
                    style={{ color: '#dc2626' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#991b1b',
                    marginBottom: 4
                  }}>
                    Submission Error
                  </h3>
                  <p style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.9rem',
                    color: '#7f1d1d'
                  }}>
                    {error?.message ||
                      errors.submit ||
                      "An error occurred. Please try again."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div style={{
            background: 'linear-gradient(135deg, #F0E6ED 0%, #FBF9F6 100%)',
            borderRadius: 20,
            boxShadow: '0 4px 20px rgba(89, 45, 74, 0.1)',
            border: '1.5px solid #B7966B', // Gold/Dust Accent Border
            padding: 32
          }}>
            <button
              type="submit"
              disabled={loading || isUploading}
              className="w-full flex items-center justify-center transition-all duration-300 transform"
              style={{
                padding: '20px 24px',
                borderRadius: 999,
                fontFamily: '"Lora", serif',
                fontWeight: 700,
                fontSize: '1.15rem',
                color: '#FBF9F6',
                background: loading || isUploading ? '#9ca3af' : '#592D4A',
                boxShadow: loading || isUploading ? 'none' : '0 8px 24px rgba(89, 45, 74, 0.18)',
                border: 'none',
                cursor: loading || isUploading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading && !isUploading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #A67390 0%, #592D4A 100%)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(89, 45, 74, 0.28)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && !isUploading) {
                  e.currentTarget.style.background = '#592D4A';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(89, 45, 74, 0.18)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading Files...
                </>
              ) : loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting Application...
                </>
              ) : (
                <>
                  Submit Application
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
            <p style={{
              textAlign: 'center',
              fontFamily: '"Poppins", sans-serif',
              fontSize: '0.8rem',
              color: '#999',
              marginTop: 16
            }}>
              By submitting this application, you agree to our terms and
              conditions
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationForm;