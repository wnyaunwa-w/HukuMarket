import { users, listings, reviews } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Star, Calendar, MessageCircle } from 'lucide-react';
import ListingCard from '@/components/listing-card';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const user = users.find((u) => u.id === params.id);
  const userListings = listings.filter(l => l.seller.id === params.id);
  const userReviews = reviews; // In a real app, filter reviews for this user

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary/20">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-4xl">{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-muted-foreground mt-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Joined {user.memberSince.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                <span>{user.rating.toFixed(1)} ({user.reviewCount} reviews)</span>
              </div>
            </div>
            <Button className="mt-4">
              <MessageCircle className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold font-headline mb-4">Active Listings from {user.name}</h2>
          {userListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {userListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">{user.name} has no active listings.</p>
            </Card>
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-bold font-headline mb-4">Reviews</h2>
          <Card>
            <CardContent className="p-6 space-y-6">
              {userReviews.length > 0 ? userReviews.map(review => (
                <div key={review.id} className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={review.author.avatarUrl} alt={review.author.name} />
                    <AvatarFallback>{review.author.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{review.author.name}</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">{review.date.toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-sm">No reviews yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
