'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { useState, useTransition } from 'react';
import { getSuggestionsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ListingImprovementOutput } from '@/ai/flows/listing-improvement-suggestions';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  quantity: z.coerce.number().int().positive('Quantity must be a positive number.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  breed: z.string().min(1, 'Please select a breed.'),
  location: z.string().min(2, 'Location is required.'),
});

export default function ListingForm() {
  const [isAiPending, startAiTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<ListingImprovementOutput | null>(null);
  const [isSuggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      quantity: 100,
      price: 3.5,
      breed: '',
      location: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Listing Submitted!',
      description: 'Your new listing is now pending review.',
    });
  }

  const handleGetSuggestions = () => {
    const values = form.getValues();
    const validatedFields = formSchema.safeParse(values);

    if (!validatedFields.success) {
      form.trigger();
      toast({
        variant: 'destructive',
        title: 'Incomplete Form',
        description: 'Please fill out all fields before getting AI suggestions.',
      });
      return;
    }

    startAiTransition(async () => {
      const result = await getSuggestionsAction({ ...values });
      if (result.success && result.data) {
        setSuggestions(result.data);
        setSuggestionModalOpen(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'AI Suggestion Failed',
          description: result.error,
        });
      }
    });
  };

  const applySuggestions = () => {
    if (suggestions) {
      form.setValue('description', suggestions.improvedDescription, { shouldValidate: true });
      form.setValue('price', suggestions.suggestedPrice, { shouldValidate: true });
      toast({
        title: 'Suggestions Applied!',
        description: 'The description and price have been updated.',
      });
      setSuggestionModalOpen(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Premium 6-Week Old Ross 308 Broilers" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breed</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a chicken breed" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ross 308">Ross 308</SelectItem>
                      <SelectItem value="Cobb 500">Cobb 500</SelectItem>
                      <SelectItem value="Hubbard">Hubbard</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your chickens, their age, weight, feed, and any other relevant details."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (per chicken)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                      <Input type="number" step="0.01" placeholder="3.50" className="pl-7" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Harare" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button type="button" variant="outline" onClick={handleGetSuggestions} disabled={isAiPending}>
              {isAiPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Get AI Suggestions
            </Button>
            <Button type="submit">Create Listing</Button>
          </div>
        </form>
      </Form>

      {suggestions && (
        <Dialog open={isSuggestionModalOpen} onOpenChange={setSuggestionModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="text-primary" />
                AI-Powered Suggestions
              </DialogTitle>
              <DialogDescription>
                We've analyzed your listing and here are some suggestions to improve it.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div>
                <h4 className="font-semibold mb-2">Suggested Price</h4>
                <div className="text-2xl font-bold text-primary">${suggestions.suggestedPrice.toFixed(2)}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Improved Description</h4>
                <p className="text-sm bg-muted p-4 rounded-md border">{suggestions.improvedDescription}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Reasoning</h4>
                <p className="text-sm text-muted-foreground">{suggestions.reasoning}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSuggestionModalOpen(false)}>Cancel</Button>
              <Button onClick={applySuggestions}>Apply Suggestions</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
