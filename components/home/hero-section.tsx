import FullWidthSlideshow from "./image-slideshow";

export default function HeroSection() {
  return (
    <>
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-[rgb(45,85,35)] mb-6">
            Modern Dairy Farm Management
          </h1>
          <p className="text-xl text-[#4a6b3d] mb-10">
            Streamline your cow management and milk production tracking with our
            intuitive platform
          </p>
        </div>
      </section>

      <div className="w-full">
        <FullWidthSlideshow />
      </div>
    </>
  );
}
