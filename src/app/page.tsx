import { listings } from '@/lib/data';
import ListingCard from '@/components/listing-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function Home() {
  const breeds = [...new Set(listings.map((listing) => listing.breed))];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">
          Find the Best Broilers in Zimbabwe
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your one-stop marketplace connecting you with trusted chicken producers across the nation.
        </p>
      </header>

      <div className="bg-card p-6 rounded-lg shadow-sm mb-8 border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium">Search Location</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="search" placeholder="e.g. Harare, Bulawayo..." className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="breed" className="text-sm font-medium">Breed</label>
            <Select>
              <SelectTrigger id="breed">
                <SelectValue placeholder="Any Breed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Breed</SelectItem>
                {breeds.map((breed) => (
                  <SelectItem key={breed} value={breed.toLowerCase()}>
                    {breed}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Price Range ($)</label>
            <div className='flex items-center gap-4 pt-2'>
              <span className='text-sm text-muted-foreground'>$1</span>
              <Slider defaultValue={[1, 50]} max={50} step={1} />
              <span className='text-sm text-muted-foreground'>$50</span>
            </div>
          </div>
          <Button className="w-full md:w-auto self-end">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
