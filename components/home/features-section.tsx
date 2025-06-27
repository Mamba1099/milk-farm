import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";

export default function FeaturesSection() {
  return (
    <section className="container max-w-full mt-10 mx-auto px-4 py-16 bg-white">
      <h2 className="text-3xl font-bold text-center text-[#2d5523] mb-12">
        Powerful Features for Your Dairy Farm
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Icons.cow className="h-10 w-10 text-[#2d5523] mb-4" />
            <CardTitle>Cow Management</CardTitle>
            <CardDescription>
              Track individual cows, health records, and breeding cycles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Icons.check className="h-4 w-4 mr-2 text-[#2d5523]" />
                Individual cow profiles
              </li>
              <li className="flex items-center">
                <Icons.check className="h-4 w-4 mr-2 text-[#2d5523]" />
                Health monitoring
              </li>
              <li className="flex items-center">
                <Icons.check className="h-4 w-4 mr-2 text-[#2d5523]" />
                Breeding cycle tracking
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Icons.milk className="h-10 w-10 text-[#2d5523] mb-4" />
            <CardTitle>Milk Production</CardTitle>
            <CardDescription>
              Monitor daily yields and analyze production trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Icons.check className="h-4 w-4 mr-2 text-[#2d5523]" />
                Daily milk recording
              </li>
              <li className="flex items-center">
                <Icons.check className="h-4 w-4 mr-2 text-[#2d5523]" />
                Production analytics
              </li>
              <li className="flex items-center">
                <Icons.check className="h-4 w-4 mr-2 text-[#2d5523]" />
                Quality parameters
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Icons.analytics className="h-10 w-10 text-[#2d5523] mb-4" />
            <CardTitle>Farm Analytics</CardTitle>
            <CardDescription>
              Data-driven insights to optimize your operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Icons.check className="h-4 w-4 mr-2 text-[#2d5523]" />
                Performance reports
              </li>
              <li className="flex items-center">
                <Icons.check className="h-4 w-4 mr-2 text-[#2d5523]" />
                Financial tracking
              </li>
              <li className="flex items-center">
                <Icons.check className="h-4 w-4 mr-2 text-[#2d5523]" />
                Inventory management
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
