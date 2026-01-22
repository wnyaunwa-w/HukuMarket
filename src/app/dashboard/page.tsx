import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Eye, ShoppingCart, MessageCircle, PlusCircle } from 'lucide-react';
import Link from 'next/link';

const stats = [
  {
    title: 'Total Revenue',
    value: '$4,285',
    icon: DollarSign,
    change: '+20.1% from last month',
  },
  {
    title: 'Active Listings',
    value: '4',
    icon: Eye,
    change: '+2 new listings this week',
  },
  {
    title: 'Total Sales',
    value: '+1,234',
    icon: ShoppingCart,
    change: '+12% from last month',
  },
  {
    title: 'New Messages',
    value: '3',
    icon: MessageCircle,
    change: '1 unread',
  },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome back, Tendai!</h1>
          <p className="text-muted-foreground">Here&apos;s a summary of your shop&apos;s activity.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Listing
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        {/* Placeholder for recent activity or chart */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A summary of your recent sales and messages.</CardDescription>
          </CardHeader>
          <CardContent className='h-64 flex items-center justify-center'>
            <p className='text-muted-foreground'>No recent activity to display.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
