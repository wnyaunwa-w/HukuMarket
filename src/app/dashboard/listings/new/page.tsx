import ListingForm from "@/components/listing-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewListingPage() {
  return (
    <div className="max-w-4xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Create a New Listing</CardTitle>
                <CardDescription>Fill out the details below to list your broiler chickens on HukuMarket.</CardDescription>
            </CardHeader>
            <CardContent>
                <ListingForm />
            </CardContent>
        </Card>
    </div>
  )
}
