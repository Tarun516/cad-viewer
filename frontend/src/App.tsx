import { useState, useCallback } from 'react';
import ModelViewer from './components/ModelViewer';
import FileUpload from './components/FileUpload';
import { Box } from 'lucide-react';

function App() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('stl');
  const [currentFile, setCurrentFile] = useState<any>(null);

  const handleFileSelect = useCallback((fileInfo: any) => {
    const url = `http://localhost:3000/uploads/${fileInfo.filename}`;
    setModelUrl(url);
    const ext = fileInfo.originalname.split('.').pop()?.toLowerCase() || 'stl';
    setFileType(ext);
    setCurrentFile(fileInfo);
  }, []);

  const handleExport = useCallback(async (format: string) => {
    if (!currentFile) return;
    try {
      const response = await fetch('http://localhost:3000/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          fileName: currentFile.filename,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Export error:', errorData.error);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentFile.originalname.split('.')[0] + '.' + format;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export fetch error:', error);
    }
  }, [currentFile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Box className="h-10 w-10 text-white mr-4" />
          <h1 className="text-3xl font-extrabold text-white">Web CAD Viewer</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {!modelUrl ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-10 transition transform duration-300 hover:scale-105 hover:shadow-3xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Upload Your 3D Model
              </h2>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                3D Model Viewer
              </h2>
              <button
                onClick={() => {
                  setModelUrl(null);
                  setCurrentFile(null);
                }}
                className="px-6 py-2 transition duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-md"
              >
                Upload New Model
              </button>
            </div>
            <ModelViewer
              modelUrl={modelUrl}
              fileType={fileType}
              onExport={handleExport}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
