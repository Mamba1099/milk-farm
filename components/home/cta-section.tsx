import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="bg-[#2d5523] text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Transform Your Dairy Farm?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join hundreds of dairy farmers who are optimizing their operations
          with our platform.
        </p>
        <Link href="/login">
          <Button size="lg" className="bg-[#79ac6d] hover:bg-[#1e3a1a]">
            Get Started
            <Icons.arrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
