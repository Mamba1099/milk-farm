"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const images = [
  "/assets/dairy-1.jpg",
  "/assets/dairy-2.jpg",
  "/assets/dairy-4.jpg",
  "/assets/dairy-5.jpg",
].filter(Boolean);

export default function FullWidthSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const goToNext = () => {
    setDirection("right");
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrev = () => {
    setDirection("left");
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, []);

  const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
  const nextIndex = (currentIndex + 1) % images.length;

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden">
      {/* Previous Image (leaving view) */}
      <div
        className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
          direction === "right" ? "-translate-x-full" : "translate-x-full"
        }`}
      >
        <div className="w-full h-full">
          {images[prevIndex] && (
            <Image
              src={images[prevIndex]}
              alt={`Dairy farm ${prevIndex + 1}`}
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
          )}
        </div>
      </div>

      {/* Current Image (entering view) */}
      <div
        className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
          direction === "right" ? "translate-x-0" : "translate-x-0"
        }`}
      >
        <div className="w-full h-full">
          {images[currentIndex] && (
            <Image
              src={images[currentIndex]}
              alt={`Dairy farm ${currentIndex + 1}`}
              fill
              className="object-cover object-center"
              priority={currentIndex === 0}
              sizes="100vw"
            />
          )}
        </div>
      </div>

      {/* Next Image (preparing to enter) */}
      <div
        className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
          direction === "right" ? "translate-x-full" : "-translate-x-full"
        }`}
      >
        <div className="w-full h-full">
          {images[nextIndex] && (
            <Image
              src={images[nextIndex]}
              alt={`Dairy farm ${nextIndex + 1}`}
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-10 transition-all"
        aria-label="Previous image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-10 transition-all"
        aria-label="Next image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? "right" : "left");
              setCurrentIndex(index);
            }}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex ? "bg-white w-6" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
