'use client'

export function ColorPalette() {
  return (
    <div className="p-8 space-y-8 bg-white">
      <div>
        <h2 className="text-2xl font-bold mb-4">School ERP Design System</h2>
        <p className="text-muted-foreground">Unified theme: White backgrounds, Orange headers, Blue buttons</p>
      </div>

      {/* Theme Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
          <div className="w-full h-12 bg-white border rounded mb-3"></div>
          <h4 className="font-semibold text-gray-700">White Backgrounds</h4>
          <p className="text-sm text-gray-600">Clean, professional base</p>
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-orange-200">
          <div className="w-full h-12 bg-orange-500 rounded mb-3"></div>
          <h4 className="font-semibold text-orange-700">Orange Headers</h4>
          <p className="text-sm text-orange-600">Components, cards, sections</p>
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
          <div className="w-full h-12 bg-blue-500 rounded mb-3"></div>
          <h4 className="font-semibold text-blue-700">Blue Buttons</h4>
          <p className="text-sm text-blue-600">Actions, links, interactions</p>
        </div>
      </div>

      {/* Orange Colors (Headers/Components) */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Orange Palette (Headers & Components)</h3>
        <div className="grid grid-cols-5 gap-2">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className="text-center">
              <div 
                className={`h-16 w-full rounded-lg bg-orange-${shade} border`}
              />
              <p className="text-xs mt-1">{shade}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Blue Colors (Buttons) */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Blue Palette (Buttons & Actions)</h3>
        <div className="grid grid-cols-5 gap-2">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className="text-center">
              <div 
                className={`h-16 w-full rounded-lg bg-blue-${shade} border`}
              />
              <p className="text-xs mt-1">{shade}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Component Examples */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Component Examples</h3>
        <div className="space-y-6">
          
          {/* Header Example */}
          <div className="bg-white rounded-lg border card-shadow overflow-hidden">
            <div className="header-gradient text-white p-4">
              <h4 className="font-semibold">Orange Header Example</h4>
              <p className="text-orange-100 text-sm">Used for page headers, section titles</p>
            </div>
            <div className="p-4">
              <p className="text-gray-600">Content area with white background</p>
            </div>
          </div>

          {/* Button Examples */}
          <div className="bg-white p-6 rounded-lg border card-shadow">
            <h4 className="font-semibold mb-4">Button Examples</h4>
            <div className="flex flex-wrap gap-4">
              <button className="button-gradient text-white px-4 py-2 rounded-md hover:opacity-90">
                Primary Action
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Blue Button
              </button>
              <button className="bg-white text-blue-500 border border-blue-500 px-4 py-2 rounded-md hover:bg-blue-50">
                Outline Button
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
                Secondary
              </button>
            </div>
          </div>

          {/* Card Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border card-shadow overflow-hidden">
              <div className="bg-orange-500 text-white p-3">
                <h5 className="font-medium">Dashboard Card</h5>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm">Card content with orange header</p>
                <button className="mt-3 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                  Action
                </button>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border card-shadow orange-accent">
              <h5 className="font-medium text-orange-700">Accent Card</h5>
              <p className="text-gray-600 text-sm mt-2">Card with orange accent border</p>
              <button className="mt-3 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                Action
              </button>
            </div>
          </div>

          {/* Form Example */}
          <div className="bg-white p-6 rounded-lg border card-shadow">
            <div className="bg-orange-500 text-white p-3 rounded-t-lg -m-6 mb-4">
              <h4 className="font-semibold">Form Example</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}