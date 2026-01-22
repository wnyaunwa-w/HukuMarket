import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const averageRating = listing.seller.rating;
  const reviewCount = listing.seller.reviewCount;

  return (
    <Card className="flex flex-col overflow-hidden h-full group transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="p-0">
        <Link href={`/listing/${listing.id}`} className="block overflow-hidden">
          <Image
            src={listing.images[0].url}
            alt={listing.title}
            width={600}
            height={400}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={listing.images[0].hint}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Badge variant="secondary" className="mb-2">{listing.breed}</Badge>
        <h3 className="font-headline font-semibold text-lg leading-tight truncate group-hover:text-primary">
          <Link href={`/listing/${listing.id}`}>{listing.title}</Link>
        </h3>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <MapPin className="w-4 h-4 mr-1.5" />
          <span>{listing.location}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <div className="font-bold text-lg text-primary">
          ${listing.price.toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground"> / each</span>
        </div>
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviewCount})</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
