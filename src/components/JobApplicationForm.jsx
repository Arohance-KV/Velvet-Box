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
          className="w-6 h-6 text-red-500"
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
          className="w-6 h-6 text-blue-500"
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
          className="w-6 h-6 text-purple-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      );
    }
    return (
      <svg
        className="w-6 h-6 text-gray-500"
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
      <div className="bg-linear-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl shadow-xl border border-purple-100 p-8 mb-8">
        <h3 className="text-2xl font-extrabold text-purple-900 mb-3 border-b-2 border-orange-400 pb-3">
          📎 Attachments & Resources
        </h3>
        <p className="text-gray-600 mb-6">
          Review the following materials related to this position
        </p>

        <div className="space-y-4">
          {sortedMedia.map((media, index) => (
            <div
              key={media._id || index}
              className="bg-white border-2 border-purple-100 rounded-xl p-5 hover:border-purple-400 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="shrink-0">{getFileIcon(media.mimeType)}</div>

                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">
                      {media.filename || "Document"}
                    </p>
                    {media.caption && (
                      <p className="text-sm text-gray-600 mt-1">
                        {media.caption}
                      </p>
                    )}
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
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
                  className="ml-4 shrink-0 bg-linear-to-r from-purple-700 to-orange-400 hover:from-purple-800 hover:to-orange-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 shadow-md group-hover:shadow-lg"
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
            className="bg-linear-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl shadow-xl border border-purple-100 p-8 mb-8 transform transition-all duration-200 hover:shadow-2xl"
          >
            <h3 className="text-2xl font-extrabold text-purple-900 mb-3">
              {section.sectionTitle}
            </h3>
            {section.sectionDescription && (
              <p className="text-gray-600 mb-6 leading-relaxed">
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
            className="bg-linear-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl shadow-xl border border-purple-100 p-8 mb-8 transform transition-all duration-200 hover:shadow-2xl"
          >
            <h3 className="text-2xl font-extrabold text-purple-900 mb-3">
              {section.sectionTitle}
            </h3>
            {section.sectionDescription && (
              <p className="text-gray-600 leading-relaxed">
                {section.sectionDescription}
              </p>
            )}
          </div>
        );
      }

      return (
        <div
          key={section._id || sectionIndex}
          className="bg-linear-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl shadow-xl border border-purple-100 p-8 mb-8 transform transition-all duration-200 hover:shadow-2xl"
        >
          <h3 className="text-2xl font-extrabold text-purple-900 mb-3">
            {section.sectionTitle}
          </h3>
          {section.sectionDescription && (
            <p className="text-gray-600 mb-6 leading-relaxed">
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
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Job Header */}
        <div className="bg-linear-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl shadow-2xl border border-purple-100 p-10 mb-10">
          <div className="border-l-4 border-purple-700 pl-6">
            <h1 className="text-4xl font-extrabold text-purple-900 mb-4 leading-tight">
              {jobData.jobTitle}
            </h1>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {jobData.jobDescription}
            </p>
          </div>

          {/* Rest of job details remain the same... */}
          <div className="mt-8 space-y-4">
            {jobData.role && (
              <div className="bg-white rounded-xl p-5 shadow-md border border-purple-100">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Role Level
                </span>
                <p className="text-base text-gray-900 mt-2 font-medium capitalize">
                  {jobData.role}
                </p>
              </div>
            )}

            {jobData.employmentType && (
              <div className="bg-white rounded-xl p-5 shadow-md border border-purple-100">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Employment Type
                </span>
                <p className="text-base text-gray-900 mt-2 font-medium capitalize">
                  {jobData.employmentType.replace("_", " ")}
                </p>
              </div>
            )}

            {jobData.qualifications && jobData.qualifications.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-md border border-purple-100">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3 block">
                  Required Qualifications
                </span>
                <div className="flex flex-wrap gap-2">
                  {jobData.qualifications.map((qual, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {qual}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {jobData.tags && jobData.tags.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-md border border-purple-100">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3 block">
                  Required Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {jobData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {jobData.expiresAt && (
              <div className="bg-white rounded-xl p-5 shadow-md border border-purple-100">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  Application Deadline
                </span>
                <p className="text-base text-gray-900 mt-2 font-medium">
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
                <div className="bg-white rounded-xl p-5 shadow-md border border-purple-100">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                    Experience Required
                  </span>
                  <p className="text-base text-gray-900 mt-2 font-medium">
                    {jobData.experienceRequired.min} -{" "}
                    {jobData.experienceRequired.max}{" "}
                    {jobData.experienceRequired.unit}
                  </p>
                </div>
              )}

              {jobData.location && (
                <div className="bg-white rounded-xl p-5 shadow-md border border-purple-100">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                    Location
                  </span>
                  <p className="text-base text-gray-900 mt-2 font-medium">
                    {jobData.location.city}, {jobData.location.state},{" "}
                    {jobData.location.country}
                    {jobData.location.isRemote && (
                      <span className="ml-2 text-green-600">🌐 Remote</span>
                    )}
                  </p>
                </div>
              )}

              {shouldDisplaySalary() && (
                <div className="bg-white rounded-xl p-5 shadow-md border border-purple-100 md:col-span-2">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                    Salary Range
                  </span>
                  <p className="text-base text-gray-900 mt-2 font-medium">
                    {jobData.salary.currency}{" "}
                    {jobData.salary.min.toLocaleString()} -{" "}
                    {jobData.salary.max.toLocaleString()} /{" "}
                    {jobData.salary.period}
                    {jobData.salary.isNegotiable && (
                      <span className="ml-2 text-green-600">(Negotiable)</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {renderMediaFiles()}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-linear-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl shadow-xl border border-purple-100 p-8">
            <h3 className="text-2xl font-extrabold text-purple-900 mb-6 border-b-2 border-orange-400 pb-3">
              Candidate Information
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className={`mt-1 block w-full rounded-xl border bg-white px-4 py-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder-gray-400 ${
                    errors.name
                      ? "border-red-400 ring-2 ring-red-200"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
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
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className={`mt-1 block w-full rounded-xl border bg-white px-4 py-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder-gray-400 ${
                    errors.email
                      ? "border-red-400 ring-2 ring-red-200"
                      : "border-gray-300"
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
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
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  className={`mt-1 block w-full rounded-xl border bg-white px-4 py-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder-gray-400 ${
                    errors.phone
                      ? "border-red-400 ring-2 ring-red-200"
                      : "border-gray-300"
                  }`}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
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
            <div className="bg-linear-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start">
                <div className="shrink-0">
                  <svg
                    className="w-6 h-6 text-red-600"
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
                  <h3 className="text-sm font-bold text-red-800 mb-1">
                    Submission Error
                  </h3>
                  <p className="text-sm text-red-700">
                    {error?.message ||
                      errors.submit ||
                      "An error occurred. Please try again."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-linear-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl shadow-xl border border-purple-100 p-8">
            <button
              type="submit"
              disabled={loading || isUploading}
              className={`w-full py-5 px-6 rounded-full font-bold text-lg text-white transition-all duration-200 flex items-center justify-center shadow-xl transform hover:scale-105 ${
                loading || isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-purple-700 via-purple-800 to-orange-400 hover:from-purple-800 hover:via-purple-900 hover:to-orange-500"
              }`}
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
            <p className="text-center text-xs text-gray-500 mt-4">
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
