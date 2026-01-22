export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  location: string;
  memberSince: Date;
  rating: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  author: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  rating: number;
  comment: string;
  date: Date;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  breed: 'Ross 308' | 'Cobb 500' | 'Hubbard' | 'Other';
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  seller: User;
  images: {
    id: string;
    url: string;
    hint: string;
  }[];
  reviews: Review[];
  postedDate: Date;
}

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  receiverId: string;
}

export interface Conversation {
  id: string;
  participant: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  lastMessage: Pick<Message, 'text' | 'timestamp'>;
  unreadCount: number;
}
