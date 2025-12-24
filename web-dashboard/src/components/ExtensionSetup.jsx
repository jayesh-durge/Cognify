import React from 'react'
import { Download, FolderOpen, Settings, Chrome, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react'

export default function ExtensionSetup() {
  const handleDownload = () => {
    // Create a link to download the extension folder as zip
    window.open('https://github.com/jayesh-durge/Cognify/archive/refs/heads/main.zip', '_blank')
  }

  return (
    <div className="min-h-screen bg-[#0f1419] py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-4xl font-bold text-white mb-4">Install Cognify Extension</h1>
          <p className="text-gray-400 text-lg">Follow these simple steps to get started with AI-powered interview preparation</p>
        </div>

        {/* Download Button - Hero */}
        <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl p-8 mb-12 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white flex-1">
              <h2 className="text-2xl font-bold mb-2">Step 1: Download the Extension</h2>
              <p className="text-white/90">Click the button to download Cognify extension files</p>
            </div>
            <button
              onClick={handleDownload}
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              <Download size={24} />
              Download Extension
            </button>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="space-y-8">
          {/* Step 2 */}
          <div className="bg-[#1a1f2e] rounded-xl p-8 border border-gray-800">
            <div className="flex items-start gap-4">
              <div className="bg-primary-500/20 p-3 rounded-lg flex-shrink-0">
                <FolderOpen className="text-primary-400" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">Step 2: Extract the Files</h3>
                <p className="text-gray-400 mb-4">Extract the downloaded ZIP file to a location on your computer</p>
                <div className="bg-[#0f1419] p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <AlertCircle size={18} className="text-yellow-500" />
                    <span className="font-semibold">Important:</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    After extraction, navigate to the <code className="bg-gray-800 px-2 py-1 rounded text-primary-400">chrome-extension</code> folder inside the extracted files
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#1a1f2e] rounded-xl p-8 border border-gray-800">
            <div className="flex items-start gap-4">
              <div className="bg-purple-500/20 p-3 rounded-lg flex-shrink-0">
                <Chrome className="text-purple-400" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">Step 3: Open Chrome Extensions</h3>
                <p className="text-gray-400 mb-4">Open Google Chrome and navigate to extensions page</p>
                <div className="bg-[#0f1419] p-6 rounded-lg border border-gray-700 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</div>
                    <div>
                      <p className="text-gray-300">Type <code className="bg-gray-800 px-2 py-1 rounded text-primary-400">chrome://extensions</code> in Chrome's address bar</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</div>
                    <div>
                      <p className="text-gray-300">Press <kbd className="bg-gray-800 px-2 py-1 rounded text-white border border-gray-600">Enter</kbd></p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Chrome size={18} />
                    <span className="font-semibold">Visual Preview:</span>
                  </div>
                  <div className="mt-3 bg-white rounded-lg p-4">
                    <img 
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='80' viewBox='0 0 600 80'%3E%3Crect width='600' height='80' fill='%23f5f5f5' rx='8'/%3E%3Ctext x='20' y='45' font-family='Arial' font-size='18' fill='%23333'%3Echrome://extensions%3C/text%3E%3Crect x='550' y='30' width='30' height='20' fill='%234285f4' rx='4'/%3E%3C/svg%3E" 
                      alt="Chrome address bar" 
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#1a1f2e] rounded-xl p-8 border border-gray-800">
            <div className="flex items-start gap-4">
              <div className="bg-green-500/20 p-3 rounded-lg flex-shrink-0">
                <Settings className="text-green-400" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">Step 4: Enable Developer Mode</h3>
                <p className="text-gray-400 mb-4">Turn on Developer mode to load unpacked extensions</p>
                <div className="bg-[#0f1419] p-6 rounded-lg border border-gray-700 space-y-4">
                  <div className="flex items-start gap-3">
                    <ArrowRight className="text-primary-400 flex-shrink-0 mt-1" size={20} />
                    <p className="text-gray-300">Toggle the <span className="font-semibold text-white">"Developer mode"</span> switch in the top-right corner</p>
                  </div>
                </div>
                <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-3">
                    <Settings size={18} />
                    <span className="font-semibold">Visual Preview:</span>
                  </div>
                  <div className="bg-white rounded-lg p-6">
                    <img 
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='100' viewBox='0 0 600 100'%3E%3Crect width='600' height='100' fill='white'/%3E%3Ctext x='20' y='35' font-family='Arial' font-size='24' font-weight='bold' fill='%23333'%3EExtensions%3C/text%3E%3Crect x='480' y='20' width='100' height='30' fill='%234285f4' rx='15'/%3E%3Ctext x='495' y='42' font-family='Arial' font-size='12' fill='white'%3EDeveloper%3C/text%3E%3Ccircle cx='570' cy='35' r='10' fill='white'/%3E%3Ctext x='20' y='75' font-family='Arial' font-size='14' fill='%23666'%3EThis page is shown when Developer mode is ON%3C/text%3E%3C/svg%3E" 
                      alt="Developer mode toggle" 
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-[#1a1f2e] rounded-xl p-8 border border-gray-800">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg flex-shrink-0">
                <FolderOpen className="text-yellow-400" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">Step 5: Load Unpacked Extension</h3>
                <p className="text-gray-400 mb-4">Add the Cognify extension to Chrome</p>
                <div className="bg-[#0f1419] p-6 rounded-lg border border-gray-700 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</div>
                    <p className="text-gray-300">Click the <span className="font-semibold text-white">"Load unpacked"</span> button</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</div>
                    <p className="text-gray-300">Navigate to the <code className="bg-gray-800 px-2 py-1 rounded text-primary-400">chrome-extension</code> folder</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</div>
                    <p className="text-gray-300">Click <span className="font-semibold text-white">"Select Folder"</span></p>
                  </div>
                </div>
                <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-3">
                    <FolderOpen size={18} />
                    <span className="font-semibold">Visual Preview:</span>
                  </div>
                  <div className="bg-white rounded-lg p-6">
                    <img 
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='120' viewBox='0 0 600 120'%3E%3Crect width='600' height='120' fill='%23f5f5f5'/%3E%3Crect x='20' y='20' width='150' height='40' fill='%234285f4' rx='4'/%3E%3Ctext x='40' y='45' font-family='Arial' font-size='14' fill='white'%3ELoad unpacked%3C/text%3E%3Crect x='20' y='70' width='560' height='40' fill='white' stroke='%23ddd' stroke-width='2' rx='4'/%3E%3Ctext x='40' y='95' font-family='Arial' font-size='14' fill='%23666'%3ECognify/chrome-extension%3C/text%3E%3C/svg%3E" 
                      alt="Load unpacked button" 
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6 - Success */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-8 border border-green-500/50">
            <div className="flex items-start gap-4">
              <div className="bg-green-500 p-3 rounded-lg flex-shrink-0">
                <CheckCircle className="text-white" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">🎉 You're All Set!</h3>
                <p className="text-gray-300 mb-4">Cognify extension is now installed and ready to use</p>
                <div className="bg-[#0f1419] p-6 rounded-lg border border-gray-700 space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="text-green-400" size={20} />
                    <span>Visit LeetCode, Codeforces, CodeChef, or GeeksforGeeks</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="text-green-400" size={20} />
                    <span>Click the Cognify extension icon to start your AI interview</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="text-green-400" size={20} />
                    <span>Your progress will sync automatically to this dashboard</span>
                  </div>
                </div>
                <div className="mt-6">
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-all"
                  >
                    Go to Dashboard
                    <ArrowRight size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-12 bg-[#1a1f2e] rounded-xl p-8 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="text-yellow-500" />
            Troubleshooting
          </h3>
          <div className="space-y-3 text-gray-400">
            <div className="flex items-start gap-3">
              <span className="text-primary-400">•</span>
              <p>If the extension doesn't appear, make sure Developer mode is enabled</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-400">•</span>
              <p>Ensure you selected the correct <code className="bg-gray-800 px-2 py-1 rounded text-primary-400">chrome-extension</code> folder</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-400">•</span>
              <p>Try refreshing the extensions page after loading</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-400">•</span>
              <p>For additional help, check our <a href="https://github.com/jayesh-durge/Cognify" className="text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">GitHub repository</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
