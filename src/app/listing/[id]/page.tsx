import { listings } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, MessageCircle, Phone, Star } from 'lucide-react';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Map } from '@/components/map';

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = listings.find((l) => l.id === params.id);

  if (!listing) {
    notFound();
  }

  const { seller, reviews } = listing;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div className="md:col-span-2 space-y-8">
          {/* Image Carousel */}
          <Carousel className="w-full">
            <CarouselContent>
              {listing.images.map((image) => (
                <CarouselItem key={image.id}>
                  <Card className="overflow-hidden">
                    <Image
                      src={image.url}
                      alt={listing.title}
                      width={1200}
                      height={800}
                      className="w-full h-auto aspect-[3/2] object-cover"
                      data-ai-hint={image.hint}
                    />
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>

          {/* Listing Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="secondary">{listing.breed}</Badge>
                    <h1 className="text-3xl font-bold font-headline mt-2">{listing.title}</h1>
                    <div className="flex items-center text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4 mr-1.5" />
                        <span>{listing.location}</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary text-right">
                    ${listing.price.toFixed(2)}
                    <div className="text-sm font-normal text-muted-foreground">/ each</div>
                  </div>
              </div>
            </CardHeader>
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </CardContent>
          </Card>

          {/* Location Map */}
           <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <Map lat={listing.coordinates.lat} lng={listing.coordinates.lng} />
            </CardContent>
          </Card>


          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={review.author.avatarUrl} alt={review.author.name} />
                    <AvatarFallback>{review.author.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold">{review.author.name}</p>
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}/>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">{review.date.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet for this listing.</p>}
            </CardContent>
          </Card>
        </div>

        {/* Seller Info & Actions */}
        <div className="md:col-span-1 space-y-6">
          <Card className="sticky top-24">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                <AvatarFallback>{seller.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/profile/${seller.id}`} className="hover:underline">
                  <h3 className="text-xl font-bold">{seller.name}</h3>
                </Link>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                    <span>{seller.rating.toFixed(1)} ({seller.reviewCount} reviews)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className='text-sm text-muted-foreground'>Seller since {seller.memberSince.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
               <Button className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" /> Send Message
              </Button>
              <Button variant="outline" className="w-full">
                <Phone className="mr-2 h-4 w-4" /> Call Seller
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
