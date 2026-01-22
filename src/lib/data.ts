import type { Listing, User, Review, Conversation } from '@/lib/types';
import { getPlaceholderImage } from './placeholder-images';

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Tendai Mwari',
    avatarUrl: getPlaceholderImage('user-1').imageUrl,
    location: 'Harare',
    memberSince: new Date('2022-01-15'),
    rating: 4.8,
    reviewCount: 25,
  },
  {
    id: 'user-2',
    name: 'Chipo Moyo',
    avatarUrl: getPlaceholderImage('user-2').imageUrl,
    location: 'Bulawayo',
    memberSince: new Date('2021-11-20'),
    rating: 4.9,
    reviewCount: 42,
  },
  {
    id: 'user-3',
    name: 'Farai Zhou',
    avatarUrl: getPlaceholderImage('user-3').imageUrl,
    location: 'Mutare',
    memberSince: new Date('2023-03-10'),
    rating: 4.6,
    reviewCount: 12,
  },
  {
    id: 'user-4',
    name: 'Rudo Shumba',
    avatarUrl: getPlaceholderImage('user-4').imageUrl,
    location: 'Gweru',
    memberSince: new Date('2022-08-05'),
    rating: 4.7,
    reviewCount: 18,
  }
];

export const reviews: Review[] = [
    {
        id: 'review-1',
        author: { id: 'user-2', name: 'Chipo Moyo', avatarUrl: getPlaceholderImage('user-2').imageUrl },
        rating: 5,
        comment: 'Excellent quality chickens, very healthy and well-cared for. Tendai was very professional.',
        date: new Date('2023-10-20'),
    },
    {
        id: 'review-2',
        author: { id: 'user-3', name: 'Farai Zhou', avatarUrl: getPlaceholderImage('user-3').imageUrl },
        rating: 4,
        comment: 'Good birds, but communication could have been a bit faster. Overall, a positive experience.',
        date: new Date('2023-11-05'),
    },
    {
        id: 'review-3',
        author: { id: 'user-4', name: 'Rudo Shumba', avatarUrl: getPlaceholderImage('user-4').imageUrl },
        rating: 5,
        comment: "I'm a repeat customer for a reason. Always top-notch service and product from Tendai.",
        date: new Date('2023-11-15'),
    }
];

export const listings: Listing[] = [
  {
    id: '1',
    title: 'Premium Ross 308 Broilers - 6 Weeks',
    description: 'Healthy, vaccine-free Ross 308 broiler chickens. Raised on organic feed. Ready for market. Average weight 2.2kg.',
    price: 3.50,
    quantity: 200,
    breed: 'Ross 308',
    location: 'Harare',
    coordinates: { lat: -17.8252, lng: 31.0335 },
    seller: users[0],
    images: [
      { id: '1', url: getPlaceholderImage('chicken-1').imageUrl, hint: getPlaceholderImage('chicken-1').imageHint },
      { id: '2', url: getPlaceholderImage('chicken-2').imageUrl, hint: getPlaceholderImage('chicken-2').imageHint },
    ],
    reviews: reviews,
    postedDate: new Date('2024-05-20'),
  },
  {
    id: '2',
    title: 'Fast-Growing Cobb 500 Chickens',
    description: 'Get the best Cobb 500 broilers in Bulawayo. Strong, healthy birds perfect for your business. Vaccinations are up to date.',
    price: 3.80,
    quantity: 150,
    breed: 'Cobb 500',
    location: 'Bulawayo',
    coordinates: { lat: -20.1539, lng: 28.5899 },
    seller: users[1],
    images: [
      { id: '3', url: getPlaceholderImage('chicken-3').imageUrl, hint: getPlaceholderImage('chicken-3').imageHint },
      { id: '4', url: getPlaceholderImage('chicken-4').imageUrl, hint: getPlaceholderImage('chicken-4').imageHint },
    ],
    reviews: [],
    postedDate: new Date('2024-05-18'),
  },
  {
    id: '3',
    title: 'Affordable Hubbard Broilers',
    description: 'Looking for cost-effective but high-quality chickens? Our Hubbard broilers are the perfect choice. Located conveniently in Mutare.',
    price: 3.20,
    quantity: 300,
    breed: 'Hubbard',
    location: 'Mutare',
    coordinates: { lat: -18.9737, lng: 32.6544 },
    seller: users[2],
    images: [
        { id: '5', url: getPlaceholderImage('chicken-5').imageUrl, hint: getPlaceholderImage('chicken-5').imageHint }
    ],
    reviews: [],
    postedDate: new Date('2024-05-21'),
  },
  {
    id: '4',
    title: 'Gweru-Raised Ross 308 for Sale',
    description: 'Prime broiler chickens available now in Gweru. Our birds are known for their excellent meat-to-bone ratio.',
    price: 3.60,
    quantity: 180,
    breed: 'Ross 308',
    location: 'Gweru',
    coordinates: { lat: -19.4518, lng: 29.8144 },
    seller: users[3],
    images: [
        { id: '6', url: getPlaceholderImage('chicken-6').imageUrl, hint: getPlaceholderImage('chicken-6').imageHint }
    ],
    reviews: [],
    postedDate: new Date('2024-05-19'),
  },
];

export const conversations: Conversation[] = [
    {
        id: 'conv-1',
        participant: users[1],
        lastMessage: {
            text: 'Yes, they are still available. When can you collect?',
            timestamp: new Date(new Date().getTime() - 5 * 60 * 1000), // 5 minutes ago
        },
        unreadCount: 0,
    },
    {
        id: 'conv-2',
        participant: users[2],
        lastMessage: {
            text: 'I can offer a small discount for bulk orders.',
            timestamp: new Date(new Date().getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        unreadCount: 2,
    },
    {
        id: 'conv-3',
        participant: users[3],
        lastMessage: {
            text: 'Thank you for your purchase!',
            timestamp: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        unreadCount: 0,
    },
];
