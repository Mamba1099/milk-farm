
export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center text-[#2d5523] mb-12">
        Simple Setup, Immediate Results
      </h2>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-[#2d5523] text-white rounded-full h-12 w-12 flex items-center justify-center shrink-0">
            1
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Create Your Farm Profile
            </h3>
            <p className="text-gray-600">
              Set up your farm details, including location, herd size, and
              production goals.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-[#2d5523] text-white rounded-full h-12 w-12 flex items-center justify-center shrink-0">
            2
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Add Your Cattle</h3>
            <p className="text-gray-600">
              Input your herd information including breed, age, and production
              history.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-[#2d5523] text-white rounded-full h-12 w-12 flex items-center justify-center shrink-0">
            3
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Start Tracking</h3>
            <p className="text-gray-600">
              Begin recording milk production, health checks, and other daily
              activities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
