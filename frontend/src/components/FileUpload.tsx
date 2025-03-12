import React, { useCallback, useState, useEffect } from "react";
import { Upload, CheckCircle, AlertCircle, Loader } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: any) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{message: string, type: "info" | "error" | "success"} | null>(null);

  // Reset feedback message after 5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Common function to handle file upload
  const uploadFile = async (file: File) => {
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (file && (fileExt === "stl" || fileExt === "obj")) {
      setUploadStatus("uploading");
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("http://localhost:3000/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setUploadStatus("success");
          setUploadedFileName(data.file.filename);
          onFileSelect(data.file);
          setFeedback({
            message: `${file.name} successfully uploaded!`,
            type: "success"
          });
        } else {
          setUploadStatus("error");
          setFeedback({
            message: data.error || "Upload failed",
            type: "error"
          });
        }
      } catch (err) {
        setUploadStatus("error");
        setFeedback({
          message: "Connection error. Please try again.",
          type: "error"
        });
      }
    } else {
      setFeedback({
        message: "Please upload only STL or OBJ files.",
        type: "error"
      });
    }
  };

  // Drag & drop file handlers
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  }, []);

  // File input handler
  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    []
  );

  // Export file from backend
  const handleExport = async (format: string) => {
    if (!uploadedFileName) {
      setFeedback({
        message: "No file uploaded.",
        type: "error"
      });
      return;
    }
    
    setExportLoading(format);
    
    try {
      const response = await fetch("http://localhost:3000/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format,
          fileName: uploadedFileName,
        }),
      });

      // Check if response returns JSON (likely an error) instead of the file blob
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        setFeedback({
          message: errorData.error || `Export to ${format.toUpperCase()} failed`,
          type: "error"
        });
        setExportLoading(null);
        return;
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        setFeedback({
          message: "Empty file received. Try again.",
          type: "error"
        });
        setExportLoading(null);
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${uploadedFileName.split('.')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setFeedback({
        message: `Successfully exported as ${format.toUpperCase()}!`,
        type: "success"
      });
    } catch (err) {
      setFeedback({
        message: "Export failed. Please try again.",
        type: "error"
      });
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ease-in-out ${
          isDragging 
            ? "border-blue-500 bg-blue-50 shadow-lg scale-105" 
            : uploadStatus === "success" 
              ? "border-green-400 bg-green-50" 
              : uploadStatus === "error" 
                ? "border-red-400 bg-red-50" 
                : "border-gray-300 hover:border-blue-500 hover:shadow-md"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".stl,.obj"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          {uploadStatus === "uploading" ? (
            <Loader className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
          ) : uploadStatus === "success" ? (
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
          ) : uploadStatus === "error" ? (
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          ) : (
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
          )}
          
          <p className={`text-lg font-medium transition-colors ${
            isDragging ? "text-blue-600" : 
            uploadStatus === "success" ? "text-green-600" : 
            uploadStatus === "error" ? "text-red-600" : 
            "text-gray-700"
          }`}>
            {isDragging 
              ? "Release to upload" 
              : uploadStatus === "uploading" 
                ? "Uploading..." 
                : uploadStatus === "success" 
                  ? "Upload successful!" 
                  : uploadStatus === "error" 
                    ? "Upload failed!" 
                    : "Drag and drop your 3D model here"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: STL, OBJ
          </p>
        </label>
      </div>
      
      {feedback && (
        <div className={`p-3 rounded-md transition-all duration-300 animate-fade-in flex items-center ${
          feedback.type === "error" ? "bg-red-100 text-red-800" :
          feedback.type === "success" ? "bg-green-100 text-green-800" :
          "bg-blue-100 text-blue-800"
        }`}>
          {feedback.type === "error" ? (
            <AlertCircle className="w-5 h-5 mr-2" />
          ) : feedback.type === "success" ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : null}
          <span>{feedback.message}</span>
        </div>
      )}
      
      {uploadedFileName && (
        <div className="mt-4 text-center animate-fade-in">
          <p className="text-gray-700 font-medium">
            Uploaded File:{" "}
            <span className="text-blue-600">{uploadedFileName}</span>
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <button
              onClick={() => handleExport("stl")}
              disabled={exportLoading !== null}
              className={`px-6 py-2 transition transform duration-300 hover:scale-105 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-md flex items-center justify-center ${
                exportLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {exportLoading === "stl" ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                "Export as STL"
              )}
            </button>
            <button
              onClick={() => handleExport("obj")}
              disabled={exportLoading !== null}
              className={`px-6 py-2 transition transform duration-300 hover:scale-105 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-md flex items-center justify-center ${
                exportLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {exportLoading === "obj" ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                "Export as OBJ"
              )}
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
